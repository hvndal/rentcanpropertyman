require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const https   = require('https');
const { createClient } = require('@supabase/supabase-js');

const app  = express();
const PORT = process.env.PORT || 3000;

const IS_PROD = process.env.VERCEL === '1'
  || process.env.NODE_ENV === 'production'
  || !!process.env.VERCEL_ENV;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

function normalizePhone(phone) {
  let digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 11) digits = digits.slice(1);
  // Indian 10-digit local → prepend 91
  if (digits.length === 10) digits = '91' + digits;
  return digits;
}

function msg91Configured() {
  const key = (process.env.MSG91_AUTH_KEY || '').trim();
  const template = (process.env.MSG91_TEMPLATE_ID || '').trim();
  return Boolean(key && template);
}

function httpsJson(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (apiRes) => {
      let data = '';
      apiRes.on('data', chunk => data += chunk);
      apiRes.on('end', () => {
        try {
          resolve({ status: apiRes.statusCode, body: data, json: data ? JSON.parse(data) : null });
        } catch (e) {
          resolve({ status: apiRes.statusCode, body: data, json: null });
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy(new Error('MSG91 request timed out'));
    });
    if (body) req.write(body);
    req.end();
  });
}

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

// ── Serve Supabase anon config to browser ──
app.get('/api/config', (req, res) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL || null,
    supabaseKey: process.env.SUPABASE_KEY || null,
    msg91Ready: msg91Configured()
  });
});

// ── Health check ──
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    time: new Date().toISOString(),
    env: IS_PROD ? 'production' : 'development',
    supabase: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_KEY),
    msg91: msg91Configured(),
    phoneAuth: Boolean(getSupabaseAdmin())
  });
});

// ── Key Holding & Inspection Utility APIs ──
app.get('/api/inspection-schedule', (req, res) => {
  const d = new Date();
  const year = d.getFullYear();
  const month = d.getMonth();
  const currentDay = d.getDate();

  let targetMonth = month;
  let targetYear = year;

  if (currentDay > 5) {
    targetMonth += 1;
    if (targetMonth > 11) {
      targetMonth = 0;
      targetYear += 1;
    }
  }

  const nextInspectionDate = new Date(targetYear, targetMonth, 5).toISOString().split('T')[0];
  res.json({
    next_inspection_date: nextInspectionDate,
    rule: 'Always 5th of every month',
    days_remaining: Math.ceil((new Date(nextInspectionDate) - d) / (1000 * 60 * 60 * 24))
  });
});

// ── MSG91 Send OTP ──
app.post('/api/send-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ type: 'error', message: 'Phone number required.' });

  const MSG91_AUTH_KEY = (process.env.MSG91_AUTH_KEY || '').trim();
  const MSG91_TEMPLATE_ID = (process.env.MSG91_TEMPLATE_ID || '').trim();
  const cleanPhone = normalizePhone(phone);

  if (cleanPhone.length < 10 || cleanPhone.length > 15) {
    return res.status(400).json({ type: 'error', message: 'Enter a valid mobile number with country code.' });
  }

  // Never silently mock OTP in production / Vercel
  if (!MSG91_AUTH_KEY || !MSG91_TEMPLATE_ID) {
    console.error('[MSG91] Keys missing. AUTH_KEY=' + Boolean(MSG91_AUTH_KEY) + ' TEMPLATE_ID=' + Boolean(MSG91_TEMPLATE_ID));
    if (IS_PROD) {
      return res.status(503).json({
        type: 'error',
        message: 'SMS OTP is not configured on the server. Please use Google or Email sign-in, or contact support.'
      });
    }
    console.warn('[DEV] MSG91 keys not set. Returning mock request_id.');
    return res.json({ type: 'success', request_id: 'dev-mock-' + Date.now(), message: 'OTP sent (dev mode).', mode: 'dev' });
  }

  const payload = JSON.stringify({
    template_id: MSG91_TEMPLATE_ID,
    mobile: cleanPhone,
    otp_length: 6,
    otp_expiry: 5
  });

  const options = {
    method: 'POST',
    hostname: 'control.msg91.com',
    path: '/api/v5/otp?template_id=' + encodeURIComponent(MSG91_TEMPLATE_ID),
    headers: {
      'authkey': MSG91_AUTH_KEY,
      'content-type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  try {
    let lastError = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const result = await httpsJson(options, payload);
        console.log('[MSG91 Send OTP attempt ' + attempt + ']:', result.status, result.body);
        const parsed = result.json || {};
        if (parsed.type === 'success' || parsed.request_id) {
          return res.json({
            type: 'success',
            request_id: parsed.request_id || ('msg91-' + Date.now()),
            message: 'OTP sent successfully.',
            mode: 'live'
          });
        }
        lastError = parsed.message || parsed.msg || parsed.error || 'Failed to send OTP via MSG91.';
        // Retry once on transient failures
        if (attempt === 1 && result.status >= 500) continue;
        break;
      } catch (e) {
        lastError = e.message;
        if (attempt === 1) continue;
      }
    }
    return res.status(400).json({ type: 'error', message: lastError || 'Failed to send OTP.' });
  } catch (e) {
    console.error('[MSG91 Request Error]:', e);
    return res.status(500).json({ type: 'error', message: 'OTP service unreachable. Please try again.' });
  }
});

// ── MSG91 Verify OTP (+ optional Supabase session) ──
app.post('/api/verify-otp', async (req, res) => {
  const { phone, otp, request_id } = req.body;
  if (!phone || !otp) return res.status(400).json({ type: 'error', message: 'Phone and OTP required.' });

  const MSG91_AUTH_KEY = (process.env.MSG91_AUTH_KEY || '').trim();
  const cleanPhone = normalizePhone(phone);
  const otpCode = String(otp).replace(/\D/g, '');

  if (otpCode.length !== 6) {
    return res.status(400).json({ type: 'error', message: 'Enter the 6-digit OTP.' });
  }

  // Block accidental mock verify in production
  if (request_id && String(request_id).startsWith('dev-mock-') && IS_PROD) {
    return res.status(400).json({ type: 'error', message: 'Invalid OTP session. Please request a new code.' });
  }

  if (!MSG91_AUTH_KEY || (request_id && String(request_id).startsWith('dev-mock-'))) {
    if (IS_PROD) {
      return res.status(503).json({ type: 'error', message: 'SMS OTP is not configured on the server.' });
    }
    if (otpCode.length === 6) {
      console.warn('[DEV] MSG91 not set. Accepting any 6-digit OTP.');
      const session = await createPhoneSession(cleanPhone);
      return res.json({ type: 'success', message: 'OTP verified (dev mode).', mode: 'dev', session });
    }
    return res.status(400).json({ type: 'error', message: 'Invalid OTP.' });
  }

  const options = {
    method: 'GET',
    hostname: 'control.msg91.com',
    path: '/api/v5/otp/verify?authkey=' + encodeURIComponent(MSG91_AUTH_KEY)
      + '&mobile=' + encodeURIComponent(cleanPhone)
      + '&otp=' + encodeURIComponent(otpCode),
    headers: { 'authkey': MSG91_AUTH_KEY }
  };

  try {
    const result = await httpsJson(options);
    console.log('[MSG91 Verify OTP]:', result.status, result.body);
    const parsed = result.json || {};
    const ok = parsed.type === 'success'
      || parsed.message === 'Number verified successfully'
      || /success|verified/i.test(String(parsed.message || ''));

    if (!ok) {
      return res.status(400).json({
        type: 'error',
        message: parsed.message || parsed.msg || 'OTP verification failed. Please try again.'
      });
    }

    const session = await createPhoneSession(cleanPhone);
    return res.json({
      type: 'success',
      message: 'OTP verified.',
      mode: 'live',
      session,
      phone: '+' + cleanPhone
    });
  } catch (e) {
    console.error('[MSG91 Verify Request Error]:', e);
    return res.status(500).json({ type: 'error', message: 'OTP service unreachable. Please try again.' });
  }
});

async function createPhoneSession(cleanPhone) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    console.warn('[Phone Auth] SUPABASE_SERVICE_ROLE_KEY not set — returning verified phone without session.');
    return null;
  }

  const e164 = '+' + cleanPhone;
  const email = cleanPhone + '@phone.rentcan.in';
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_KEY;

  try {
    // Ensure auth user exists for this phone
    const { error: createErr } = await admin.auth.admin.createUser({
      email,
      phone: e164,
      email_confirm: true,
      phone_confirm: true,
      user_metadata: { phone: e164, auth_via: 'msg91' }
    });
    if (createErr && !/already|registered|exists/i.test(createErr.message || '')) {
      console.warn('[Phone Auth] createUser:', createErr.message);
    } else {
      // Keep phone confirmed if user already existed
      try {
        const { data: linkProbe } = await admin.auth.admin.generateLink({ type: 'magiclink', email });
        const uid = linkProbe?.user?.id;
        if (uid) {
          await admin.auth.admin.updateUserById(uid, {
            phone: e164,
            phone_confirm: true,
            email_confirm: true
          });
        }
      } catch (_) {}
    }

    // Create a one-time magic link session (works for new + existing users)
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email
    });
    if (linkErr || !linkData?.properties?.hashed_token) {
      console.error('[Phone Auth] generateLink:', linkErr?.message || 'missing token');
      return null;
    }

    if (!anonKey) {
      console.error('[Phone Auth] SUPABASE_KEY missing — cannot finalize session');
      return null;
    }

    const anon = createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: verified, error: verifyErr } = await anon.auth.verifyOtp({
      token_hash: linkData.properties.hashed_token,
      type: 'email'
    });
    if (verifyErr || !verified?.session) {
      console.error('[Phone Auth] verifyOtp:', verifyErr?.message || 'no session');
      return null;
    }

    return {
      access_token: verified.session.access_token,
      refresh_token: verified.session.refresh_token,
      expires_in: verified.session.expires_in,
      user: verified.user
    };
  } catch (e) {
    console.error('[Phone Auth] session error:', e);
    return null;
  }
}

// Invite / Add Tenant API (fallback)
app.post('/api/invite-tenant', async (req, res) => {
  const { property_id, full_name, email, phone, rent_due_date } = req.body;
  if (!property_id || !full_name || (!email && !phone)) {
    return res.status(400).json({ type: 'error', message: 'Property, tenant name, and email or phone are required.' });
  }
  res.json({
    type: 'success',
    message: 'Tenant invited successfully!',
    tenant: { property_id, full_name, email, phone, rent_due_date: rent_due_date || 5 }
  });
});

// Submit Maintenance / Repair Request API (fallback)
app.post('/api/submit-maintenance', async (req, res) => {
  const { property_id, title, description, category, priority } = req.body;
  if (!property_id || !title || !description) {
    return res.status(400).json({ type: 'error', message: 'Property, title, and description are required.' });
  }
  res.json({
    type: 'success',
    message: 'Maintenance request submitted successfully!',
    request: { property_id, title, description, category: category || 'appliance', priority: priority || 'medium', status: 'pending' }
  });
});

app.use(express.static(path.join(__dirname, 'public')));

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`RentCan running 🚀 http://localhost:${PORT}`);
  console.log(`Env            🚀 ${IS_PROD ? 'production' : 'development'}`);
  console.log(`Supabase URL   🚀 ${process.env.SUPABASE_URL || '(not set)'}`);
  console.log(`MSG91          🚀 ${msg91Configured() ? 'READY' : 'NOT CONFIGURED'}`);
  console.log(`Phone sessions 🚀 ${getSupabaseAdmin() ? 'READY' : 'needs SUPABASE_SERVICE_ROLE_KEY'}`);
});

module.exports = app;
