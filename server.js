require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const https   = require('https');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ── Serve Supabase anon config to browser ─────────────────────────
app.get('/api/config', (req, res) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_KEY
  });
});

// ── Health check ───────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// ── MSG91 Send OTP ─────────────────────────────────────────────────
app.post('/api/send-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ type: 'error', message: 'Phone number required.' });

  const MSG91_AUTH_KEY   = process.env.MSG91_AUTH_KEY;
  const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID;

  if (!MSG91_AUTH_KEY || !MSG91_TEMPLATE_ID) {
    // Dev fallback: pretend OTP was sent
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
      'authkey': MSG91_AUTH_KEY,
      'content-type': 'application/json'
    }
  };

  const payload = JSON.stringify({
    template_id: MSG91_TEMPLATE_ID,
    mobile: cleanPhone,
    authkey: MSG91_AUTH_KEY
  });

  const apiReq = https.request(options, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        if (parsed.type === 'success') {
          res.json({ type: 'success', request_id: parsed.request_id });
        } else {
          res.status(400).json({ type: 'error', message: parsed.message || 'Failed to send OTP.' });
        }
      } catch(e) {
        res.status(500).json({ type: 'error', message: 'Invalid response from OTP provider.' });
      }
    });
  });

  apiReq.on('error', (e) => {
    res.status(500).json({ type: 'error', message: 'OTP service unreachable: ' + e.message });
  });

  apiReq.write(payload);
  apiReq.end();
});

// ── MSG91 Verify OTP ───────────────────────────────────────────────
app.post('/api/verify-otp', async (req, res) => {
  const { phone, otp, request_id } = req.body;
  if (!phone || !otp) return res.status(400).json({ type: 'error', message: 'Phone and OTP required.' });

  const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;

  if (!MSG91_AUTH_KEY || (request_id && request_id.startsWith('dev-mock-'))) {
    // Dev fallback: accept any 6-digit OTP
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
    path: `/api/v5/otp/verify?authkey=${MSG91_AUTH_KEY}&mobile=${cleanPhone}&otp=${otp}`,
    headers: { 'authkey': MSG91_AUTH_KEY }
  };

  const apiReq = https.request(options, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        if (parsed.type === 'success') {
          res.json({ type: 'success', message: 'OTP verified.' });
        } else {
          res.status(400).json({ type: 'error', message: parsed.message || 'OTP verification failed.' });
        }
      } catch(e) {
        res.status(500).json({ type: 'error', message: 'Invalid response from OTP provider.' });
      }
    });
  });

  apiReq.on('error', (e) => {
    res.status(500).json({ type: 'error', message: 'OTP service unreachable: ' + e.message });
  });

  apiReq.end();
});

// ── Static frontend ────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── SPA fallback ───────────────────────────────────────────────────
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`RentCan running → http://localhost:${PORT}`);
  console.log(`Supabase URL    → ${process.env.SUPABASE_URL || '(not set)'}`);
  console.log(`MSG91 Auth Key  → ${process.env.MSG91_AUTH_KEY ? 'SET' : '(not set — dev mode OTP)'}`);
});

module.exports = app;
