require('dotenv').config();
require('./lib/load-env').loadRazorEnv();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const https   = require('https');
const { createClient } = require('@supabase/supabase-js');
const {
  resolveSupabaseUrl,
  resolveSupabaseAnonKey,
  resolveMsg91WidgetId,
  resolveMsg91TokenAuth,
  resolveMsg91AuthKey
} = require('./lib/rentcan-config');
const {
  verifyWidgetAccessToken,
  extractVerifiedPhone
} = require('./lib/msg91');
const { rateLimit, clientIp } = require('./lib/rate-limit');
const { getPlan, listPlans } = require('./lib/plans');
const {
  getKeyId,
  getKeySecret,
  isRazorpayReady,
  getRazorpayClient,
  verifyPaymentSignature,
  verifyWebhookSignature
} = require('./lib/razorpay');
const crypto = require('crypto');

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
  const key = getMsg91AuthKey();
  const template = (process.env.MSG91_TEMPLATE_ID || '').trim();
  return Boolean(key && template);
}

function envPresent(name) {
  return Boolean(String(process.env[name] || '').trim());
}

function msg91WidgetConfigured() {
  return Boolean(getMsg91WidgetId() && getMsg91TokenAuth());
}

function getMsg91WidgetId() {
  return resolveMsg91WidgetId();
}

function getMsg91AuthKey() {
  return resolveMsg91AuthKey();
}

function msg91VerifyReady() {
  return Boolean(getMsg91AuthKey());
}

function getMsg91TokenAuth() {
  return resolveMsg91TokenAuth();
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

function getSupabaseAuthClient() {
  const url = resolveSupabaseUrl();
  const key = resolveSupabaseAnonKey();
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function requireAuthUser(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) return null;
  const client = getSupabaseAuthClient();
  if (!client) return null;
  const { data, error } = await client.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

// ── Serve public client config ──
app.get('/api/config', (req, res) => {
  res.json({
    supabaseUrl: resolveSupabaseUrl(),
    supabaseKey: resolveSupabaseAnonKey(),
    msg91Ready: msg91Configured() || msg91WidgetConfigured(),
    msg91Widget: {
      widgetId: getMsg91WidgetId(),
      tokenAuth: getMsg91TokenAuth(),
      ready: msg91WidgetConfigured(),
      serverVerify: msg91VerifyReady()
    },
    razorpay: {
      ready: isRazorpayReady(),
      keyId: isRazorpayReady() ? getKeyId() : null
    },
    plans: listPlans().map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      amountInr: p.amountInr,
      interval: p.interval,
      currency: p.currency
    }))
  });
});

// ── Health check ──
app.get('/api/health', (req, res) => {
  const hasServiceRole = envPresent('SUPABASE_SERVICE_ROLE_KEY') || envPresent('SUPABASE_SERVICE_KEY');
  const supabaseOk = Boolean(resolveSupabaseUrl() && resolveSupabaseAnonKey());
  const checks = {
    supabase: supabaseOk,
    msg91: msg91Configured(),
    msg91Widget: msg91WidgetConfigured(),
    msg91Verify: msg91VerifyReady(),
    phoneAuth: Boolean(getSupabaseAdmin()),
    razorpay: isRazorpayReady(),
    adminPasscode: envPresent('ADMIN_PASSCODE')
  };
  // Launch-ready when core auth works; phone/razorpay reported separately
  const ok = supabaseOk;
  const degraded = ok && (!checks.phoneAuth || !checks.msg91Verify || !checks.razorpay);
  res.status(ok ? 200 : 503).json({
    ok,
    degraded,
    time: new Date().toISOString(),
    env: IS_PROD ? 'production' : 'development',
    ...checks,
    config: {
      MSG91_AUTH_KEY: envPresent('MSG91_AUTH_KEY') || envPresent('MSG91_AUTHKEY') || envPresent('MSG91_API_KEY'),
      MSG91_TEMPLATE_ID: envPresent('MSG91_TEMPLATE_ID'),
      MSG91_WIDGET_ID: envPresent('MSG91_WIDGET_ID'),
      MSG91_TOKEN_AUTH: envPresent('MSG91_TOKEN_AUTH'),
      SUPABASE_SERVICE_ROLE_KEY: hasServiceRole,
      RAZORPAY_KEY_ID: envPresent('RAZORPAY_KEY_ID'),
      RAZORPAY_KEY_SECRET: envPresent('RAZORPAY_KEY_SECRET'),
      ADMIN_PASSCODE: envPresent('ADMIN_PASSCODE')
    }
  });
});

// ── Admin passcode verify (requires signed-in Supabase user + ADMIN_PASSCODE) ──
app.post('/api/admin/verify', async (req, res) => {
  const ip = clientIp(req);
  const limit = rateLimit({ key: `admin-verify:${ip}`, limit: 8, windowMs: 15 * 60 * 1000 });
  if (!limit.allowed) {
    return res.status(429).json({ type: 'error', message: 'Too many attempts. Try again later.' });
  }

  const expected = String(process.env.ADMIN_PASSCODE || '').trim();
  if (!expected) {
    return res.status(503).json({
      type: 'error',
      message: 'Admin portal is not configured. Set ADMIN_PASSCODE on the server.'
    });
  }

  const auth = String(req.headers.authorization || '');
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) {
    return res.status(401).json({ type: 'error', message: 'Sign in required.' });
  }

  try {
    const url = resolveSupabaseUrl();
    const key = resolveSupabaseAnonKey();
    if (!url || !key) {
      return res.status(503).json({ type: 'error', message: 'Auth not configured.' });
    }
    const anon = createClient(url, key);
    const { data: userData, error } = await anon.auth.getUser(token);
    if (error || !userData?.user) {
      return res.status(401).json({ type: 'error', message: 'Invalid session.' });
    }
  } catch (_) {
    return res.status(401).json({ type: 'error', message: 'Could not validate session.' });
  }

  const provided = String((req.body || {}).passcode || '');
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  let match = false;
  try {
    match = a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch (_) {
    match = false;
  }
  if (!match) {
    return res.status(403).json({ type: 'error', message: 'Invalid admin passcode.' });
  }

  const sessionToken = crypto.createHmac('sha256', expected).update(String(Date.now()).slice(0, -5)).digest('hex').slice(0, 24);
  return res.json({ type: 'success', token: sessionToken });
});

// After MSG91 widget verifyOtp — server verifies JWT, then creates Supabase session
app.post('/api/phone-session', async (req, res) => {
  const ip = clientIp(req);
  const limit = rateLimit({ key: `phone-session:${ip}`, limit: 15, windowMs: 15 * 60 * 1000 });
  if (!limit.allowed) {
    return res.status(429).json({
      type: 'error',
      code: 'RATE_LIMITED',
      message: 'Too many attempts. Please wait and try again.',
      retry_after: limit.retryAfterSec
    });
  }

  const { phone, access_token: accessToken } = req.body || {};
  const cleanPhone = normalizePhone(phone);
  if (!cleanPhone || cleanPhone.length < 10) {
    return res.status(400).json({ type: 'error', message: 'Valid phone number required.' });
  }

  const token = typeof accessToken === 'string' ? accessToken.trim() : '';

  if (IS_PROD && !token) {
    return res.status(401).json({
      type: 'error',
      code: 'ACCESS_TOKEN_REQUIRED',
      message: 'Complete OTP verification before signing in.'
    });
  }

  if (token) {
    if (!msg91VerifyReady()) {
      if (IS_PROD) {
        return res.status(503).json({
          type: 'error',
          code: 'MSG91_AUTH_KEY_MISSING',
          message: 'Phone sign-in is not fully configured. Use Google or Email sign-in.'
        });
      }
      console.warn('[MSG91] MSG91_AUTH_KEY not set — skipping verifyAccessToken (dev only)');
    } else {
      try {
        const verified = await verifyWidgetAccessToken(token);
        if (!verified.ok) {
          console.warn('[MSG91 verifyAccessToken] rejected:', verified.code, verified.status || '');
          return res.status(401).json({
            type: 'error',
            code: verified.code || 'MSG91_VERIFY_FAILED',
            message: 'OTP verification could not be confirmed. Please request a new code.'
          });
        }

        const msgPhone = extractVerifiedPhone(verified.data);
        if (msgPhone && msgPhone.length >= 10) {
          const normalizedMsgPhone = normalizePhone(msgPhone);
          if (normalizedMsgPhone !== cleanPhone) {
            console.warn('[MSG91] phone mismatch for session request');
            return res.status(401).json({
              type: 'error',
              code: 'PHONE_MISMATCH',
              message: 'Phone number does not match the verified OTP.'
            });
          }
        }
      } catch (e) {
        console.error('[MSG91 verifyAccessToken] error:', e.message);
        return res.status(502).json({
          type: 'error',
          code: 'MSG91_UNAVAILABLE',
          message: 'Could not verify OTP with SMS provider. Please try again.'
        });
      }
    }
  } else if (IS_PROD) {
    return res.status(401).json({
      type: 'error',
      code: 'ACCESS_TOKEN_REQUIRED',
      message: 'Complete OTP verification before signing in.'
    });
  }

  const session = await createPhoneSession(cleanPhone);
  if (!session?.access_token) {
    const adminMissing = !getSupabaseAdmin();
    return res.status(503).json({
      type: 'error',
      code: adminMissing ? 'PHONE_SESSION_UNAVAILABLE' : 'PHONE_SESSION_FAILED',
      message: adminMissing
        ? 'Phone verified, but account sign-in is not fully configured yet. Please use Google or Email sign-in for now.'
        : 'Phone verified, but we could not start your session. Please try Google or Email sign-in.'
    });
  }
  return res.json({
    type: 'success',
    message: 'Phone verified.',
    phone: '+' + cleanPhone,
    session
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
  const ip = clientIp(req);
  const limit = rateLimit({ key: `send-otp:${ip}`, limit: 8, windowMs: 15 * 60 * 1000 });
  if (!limit.allowed) {
    return res.status(429).json({
      type: 'error',
      message: 'Too many OTP requests. Please wait before trying again.',
      retry_after: limit.retryAfterSec
    });
  }

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
  const ip = clientIp(req);
  const limit = rateLimit({ key: `verify-otp:${ip}`, limit: 12, windowMs: 15 * 60 * 1000 });
  if (!limit.allowed) {
    return res.status(429).json({
      type: 'error',
      message: 'Too many verification attempts. Please wait and try again.',
      retry_after: limit.retryAfterSec
    });
  }

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
  const url = resolveSupabaseUrl();
  const anonKey = resolveSupabaseAnonKey();

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

// ── Razorpay: create order (login required) ──
app.post('/api/payments/create-order', async (req, res) => {
  const ip = clientIp(req);
  const limit = rateLimit({ key: `rzp-order:${ip}`, limit: 20, windowMs: 15 * 60 * 1000 });
  if (!limit.allowed) {
    return res.status(429).json({
      type: 'error',
      code: 'RATE_LIMITED',
      message: 'Too many payment attempts. Please wait and try again.'
    });
  }

  if (!isRazorpayReady()) {
    return res.status(503).json({
      type: 'error',
      code: 'RAZORPAY_NOT_CONFIGURED',
      message: 'Online payments are not enabled yet. Please contact RentCan.'
    });
  }

  const user = await requireAuthUser(req);
  if (!user) {
    return res.status(401).json({
      type: 'error',
      code: 'LOGIN_REQUIRED',
      message: 'Please sign in to pay for a RentCan plan.'
    });
  }

  const plan = getPlan(req.body?.plan);
  if (!plan || !['residential', 'commercial'].includes(plan.id)) {
    return res.status(400).json({
      type: 'error',
      message: 'Choose a valid plan: residential or commercial.'
    });
  }

  try {
    const rzp = getRazorpayClient();
    const receipt = `rc_${String(user.id).replace(/-/g, '').slice(0, 10)}_${Date.now()}`.slice(0, 40);
    const order = await rzp.orders.create({
      amount: plan.amountPaise,
      currency: plan.currency,
      receipt,
      notes: {
        user_id: user.id,
        plan_id: plan.id,
        plan_name: plan.name,
        email: user.email || ''
      }
    });

    const admin = getSupabaseAdmin();
    if (admin) {
      await admin.from('service_orders').insert({
        user_id: user.id,
        plan_id: plan.id,
        plan_name: plan.name,
        amount_paise: plan.amountPaise,
        currency: plan.currency,
        status: 'created',
        razorpay_order_id: order.id,
        notes: { email: user.email || null }
      });
    }

    return res.json({
      type: 'success',
      key_id: getKeyId(),
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      plan: {
        id: plan.id,
        name: plan.name,
        amountInr: plan.amountInr,
        description: plan.description
      },
      prefill: {
        email: user.email || '',
        name: user.user_metadata?.full_name || user.user_metadata?.name || ''
      }
    });
  } catch (e) {
    console.error('[Razorpay] create-order failed:', e?.message || e);
    return res.status(502).json({
      type: 'error',
      code: 'RAZORPAY_ORDER_FAILED',
      message: 'Could not start payment. Please try again in a moment.'
    });
  }
});

// ── Razorpay: verify payment signature (login required) ──
app.post('/api/payments/verify', async (req, res) => {
  if (!isRazorpayReady()) {
    return res.status(503).json({ type: 'error', code: 'RAZORPAY_NOT_CONFIGURED', message: 'Payments unavailable.' });
  }

  const user = await requireAuthUser(req);
  if (!user) {
    return res.status(401).json({ type: 'error', code: 'LOGIN_REQUIRED', message: 'Please sign in again.' });
  }

  const {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
    plan: planId
  } = req.body || {};

  if (!orderId || !paymentId || !signature) {
    return res.status(400).json({ type: 'error', message: 'Missing payment confirmation details.' });
  }

  const ok = verifyPaymentSignature({ orderId, paymentId, signature });
  if (!ok) {
    return res.status(400).json({
      type: 'error',
      code: 'INVALID_SIGNATURE',
      message: 'Payment could not be verified. If money was deducted, contact support with your payment ID.'
    });
  }

  const plan = getPlan(planId);
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data: existing } = await admin
      .from('service_orders')
      .select('id, user_id, status')
      .eq('razorpay_order_id', orderId)
      .maybeSingle();

    if (existing && existing.user_id !== user.id) {
      return res.status(403).json({ type: 'error', message: 'This order does not belong to your account.' });
    }

    if (existing) {
      await admin.from('service_orders').update({
        status: 'paid',
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        paid_at: new Date().toISOString()
      }).eq('id', existing.id);
    } else {
      await admin.from('service_orders').insert({
        user_id: user.id,
        plan_id: plan?.id || planId || 'unknown',
        plan_name: plan?.name || planId || 'Plan',
        amount_paise: plan?.amountPaise || 0,
        currency: 'INR',
        status: 'paid',
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        paid_at: new Date().toISOString()
      });
    }
  }

  return res.json({
    type: 'success',
    message: 'Payment successful. Welcome to RentCan.',
    payment_id: paymentId,
    order_id: orderId,
    plan: plan ? { id: plan.id, name: plan.name, amountInr: plan.amountInr } : null
  });
});

app.get('/api/payments/plans', (req, res) => {
  res.json({ type: 'success', plans: listPlans() });
});

// ── Razorpay webhook (payment.captured → mark service_orders paid) ──
app.post('/api/payments/webhook', async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
  if (!verifyWebhookSignature(raw, signature)) {
    return res.status(400).json({ type: 'error', message: 'Invalid webhook signature.' });
  }

  const event = typeof req.body === 'object' ? req.body : {};
  const eventName = event.event || '';
  const paymentEntity = event.payload?.payment?.entity || {};
  const orderId = paymentEntity.order_id;
  const paymentId = paymentEntity.id;

  if (eventName === 'payment.captured' && orderId) {
    const admin = getSupabaseAdmin();
    if (admin) {
      try {
        await admin
          .from('service_orders')
          .update({
            status: 'paid',
            razorpay_payment_id: paymentId || null,
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('razorpay_order_id', orderId);
      } catch (e) {
        console.error('[Razorpay webhook] update failed:', e.message);
      }
    }
  }

  return res.json({ type: 'success' });
});

// Invite / Add Tenant API (fallback) — requires auth
app.post('/api/invite-tenant', async (req, res) => {
  const auth = String(req.headers.authorization || '');
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ type: 'error', message: 'Sign in required.' });
  }
  const { property_id, full_name, email, phone, rent_due_date } = req.body || {};
  if (!property_id || !full_name || (!email && !phone)) {
    return res.status(400).json({ type: 'error', message: 'Property, tenant name, and email or phone are required.' });
  }
  res.json({
    type: 'success',
    message: 'Tenant invited successfully!',
    tenant: { property_id, full_name, email, phone, rent_due_date: rent_due_date || 5 }
  });
});

// Submit Maintenance / Repair Request API (fallback) — requires auth
app.post('/api/submit-maintenance', async (req, res) => {
  const auth = String(req.headers.authorization || '');
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ type: 'error', message: 'Sign in required.' });
  }
  const { property_id, title, description, category, priority } = req.body || {};
  if (!property_id || !title || !description) {
    return res.status(400).json({ type: 'error', message: 'Property, title, and description are required.' });
  }
  res.json({
    type: 'success',
    message: 'Maintenance request submitted successfully!',
    request: { property_id, title, description, category: category || 'appliance', priority: priority || 'medium', status: 'pending' }
  });
});

// SEO / crawler files — explicit routes so they never fall through to SPA fallback
['/robots.txt', '/sitemap.xml', '/humans.txt', '/manifest.json', '/favicon.ico', '/apple-touch-icon.png'].forEach((file) => {
  app.get(file, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', file.replace(/^\//, '')));
  });
});

// 301 Redirect .html extensions to Clean URLs (e.g. /investors.html -> /investors)
app.use((req, res, next) => {
  if (req.path.endsWith('.html') && req.path !== '/404.html') {
    const cleanPath = req.path.slice(0, -5);
    const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    return res.redirect(301, cleanPath + query);
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

const CLEAN_PAGES = {
  '/': 'index.html',
  '/login': 'login.html',
  '/dashboard': 'dashboard.html',
  '/documents': 'documents.html',
  '/payments': 'payments.html',
  '/inspections': 'inspections.html',
  '/reports': 'reports.html',
  '/info': 'info.html',
  '/investors': 'investors.html',
  '/admin': 'admin.html',
  '/checkout': 'checkout.html'
};

Object.keys(CLEAN_PAGES).forEach((route) => {
  if (route === '/') return;
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', CLEAN_PAGES[route]));
  });
});

// Fallback: unknown non-API paths → real 404
app.get(/^\/(?!api).*/, (req, res) => {
  const base = req.path.replace(/\/$/, '') || '/';
  const file = CLEAN_PAGES[base];
  if (file) {
    return res.sendFile(path.join(__dirname, 'public', file));
  }
  if (base.endsWith('.html')) {
    const candidate = path.join(__dirname, 'public', path.basename(base));
    return res.sendFile(candidate, (err) => {
      if (err) res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
    });
  }
  return res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`RentCan running 🚀 http://localhost:${PORT}`);
    console.log(`Env            🚀 ${IS_PROD ? 'production' : 'development'}`);
    console.log(`Supabase URL   🚀 ${resolveSupabaseUrl()}`);
    console.log(`MSG91 API       🚀 ${msg91Configured() ? 'READY' : 'optional fallback'}`);
    console.log(`MSG91 Widget    🚀 ${msg91WidgetConfigured() ? 'READY' : 'NOT CONFIGURED'}`);
    console.log(`MSG91 Verify    🚀 ${msg91VerifyReady() ? 'READY' : 'set MSG91_AUTH_KEY on server'}`);
    console.log(`Phone sessions  🚀 ${getSupabaseAdmin() ? 'READY' : 'needs SUPABASE_SERVICE_ROLE_KEY'}`);
    console.log(`Razorpay        🚀 ${isRazorpayReady() ? 'READY' : 'set RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET'}`);
    console.log(`Admin portal    🚀 ${envPresent('ADMIN_PASSCODE') ? 'READY' : 'set ADMIN_PASSCODE'}`);
  });
}

module.exports = app;
