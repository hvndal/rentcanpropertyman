require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const https   = require('https');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ── Serve Supabase anon config to browser ──
app.get('/api/config', (req, res) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_KEY
  });
});

// ── Health check ──
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// ── MSG91 Send OTP ──
app.post('/api/send-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ type: 'error', message: 'Phone number required.' });

  const MSG91_AUTH_KEY   = process.env.MSG91_AUTH_KEY;
  const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID;

  if (!MSG91_AUTH_KEY || !MSG91_TEMPLATE_ID) {
    console.warn('[DEV] MSG91 keys not set. Returning mock request_id.');
    return res.json({ type: 'success', request_id: 'dev-mock-' + Date.now(), message: 'OTP sent (dev mode).' });
  }

  // Sanitize: remove +, spaces
  const cleanPhone = phone.replace(/\D/g, '');

  const options = {
    method: 'POST',
    hostname: 'control.msg91.com',
    path: '/api/v5/otp',
    headers: {
      'authkey': MSG91_AUTH_KEY.trim(),
      'content-type': 'application/json'
    }
  };

  const payload = JSON.stringify({
    template_id: MSG91_TEMPLATE_ID.trim(),
    mobile: cleanPhone,
    authkey: MSG91_AUTH_KEY.trim()
  });

  const apiReq = https.request(options, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      try {
        console.log('[MSG91 Send OTP Response]:', data);
        const parsed = JSON.parse(data);
        if (parsed.type === 'success' || parsed.request_id) {
          res.json({ type: 'success', request_id: parsed.request_id || 'msg91-ok' });
        } else {
          console.error('[MSG91 Send OTP Failed]:', parsed);
          res.status(400).json({ type: 'error', message: parsed.message || parsed.msg || 'Failed to send OTP via MSG91.' });
        }
      } catch(e) {
        console.error('[MSG91 Send OTP Parse Error]:', data);
        res.status(500).json({ type: 'error', message: 'Invalid response from OTP provider.' });
      }
    });
  });

  apiReq.on('error', (e) => {
    console.error('[MSG91 Request Error]:', e);
    res.status(500).json({ type: 'error', message: 'OTP service unreachable: ' + e.message });
  });

  apiReq.write(payload);
  apiReq.end();
});

// ── MSG91 Verify OTP ──
app.post('/api/verify-otp', async (req, res) => {
  const { phone, otp, request_id } = req.body;
  if (!phone || !otp) return res.status(400).json({ type: 'error', message: 'Phone and OTP required.' });

  const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;

  if (!MSG91_AUTH_KEY || (request_id && request_id.startsWith('dev-mock-'))) {
    if (otp.length === 6) {
      console.warn('[DEV] MSG91 not set. Accepting any 6-digit OTP.');
      return res.json({ type: 'success', message: 'OTP verified (dev mode).' });
    }
    return res.status(400).json({ type: 'error', message: 'Invalid OTP.' });
  }

  const cleanPhone = phone.replace(/\D/g, '');

  const options = {
    method: 'GET',
    hostname: 'control.msg91.com',
    path: `/api/v5/otp/verify?authkey=${MSG91_AUTH_KEY.trim()}&mobile=${cleanPhone}&otp=${otp}`,
    headers: { 'authkey': MSG91_AUTH_KEY.trim() }
  };

  const apiReq = https.request(options, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      try {
        console.log('[MSG91 Verify OTP Response]:', data);
        const parsed = JSON.parse(data);
        if (parsed.type === 'success' || parsed.message === 'Number verified successfully') {
          res.json({ type: 'success', message: 'OTP verified.' });
        } else {
          console.error('[MSG91 Verify OTP Failed]:', parsed);
          res.status(400).json({ type: 'error', message: parsed.message || parsed.msg || 'OTP verification failed.' });
        }
      } catch(e) {
        console.error('[MSG91 Verify OTP Parse Error]:', data);
        res.status(500).json({ type: 'error', message: 'Invalid response from OTP provider.' });
      }
    });
  });

  apiReq.on('error', (e) => {
    console.error('[MSG91 Verify Request Error]:', e);
    res.status(500).json({ type: 'error', message: 'OTP service unreachable: ' + e.message });
  });

  apiReq.end();
});

// ── Static frontend ──
app.use(express.static(path.join(__dirname, 'public')));

// ── SPA fallback ──
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`RentCan running 🚀 http://localhost:${PORT}`);
  console.log(`Supabase URL    🚀 ${process.env.SUPABASE_URL || '(not set)'}`);
  console.log(`MSG91 Auth Key  🚀 ${process.env.MSG91_AUTH_KEY ? 'SET' : '(not set)'}`);
});

module.exports = app;
