require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Supabase admin client (server-side only)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY
);

// ── Serve public Supabase config to the browser (anon key only) ──
app.get('/api/config', (req, res) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_KEY   // anon/public key
  });
});

// ── Server-side login endpoint (email + password + role) ──
app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // Sign in with Supabase
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    const user = data.user;

    // Optional: check user_metadata role matches selected role
    const storedRole = user.user_metadata?.role;
    if (storedRole && storedRole !== role) {
      return res.status(403).json({ error: `This account is registered as a ${storedRole}, not ${role}.` });
    }

    return res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: storedRole || role,
        access_token: data.session.access_token
      }
    });

  } catch (err) {
    console.error('Auth error:', err);
    return res.status(500).json({ error: 'Server error during authentication.' });
  }
});

// ── Register new user (landlord or tenant) ──
app.post('/api/auth/register', async (req, res) => {
  const { email, password, role, full_name } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password and role are required.' });
  }
  if (!['landlord', 'tenant'].includes(role)) {
    return res.status(400).json({ error: 'Role must be landlord or tenant.' });
  }

  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role, full_name: full_name || '' }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({
      message: 'Account created successfully.',
      user: { id: data.user.id, email: data.user.email, role }
    });

  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Server error during registration.' });
  }
});

// ── Serve static frontend ──
app.use(express.static(path.join(__dirname, 'public')));

// ── SPA fallback ──
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`RentCan server running at http://localhost:${PORT}`);
});

module.exports = app;
