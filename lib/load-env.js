/**
 * Load local razor.env for Razorpay test keys (never commit that file).
 * Vercel/production should set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in project env.
 */
const fs = require('fs');
const path = require('path');

function loadRazorEnv() {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) return;

  const file = path.join(process.cwd(), 'razor.env');
  if (!fs.existsSync(file)) return;

  const text = fs.readFileSync(file, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const keyMatch = trimmed.match(/^Test API Key\s*=\s*(.+)$/i);
    if (keyMatch && !process.env.RAZORPAY_KEY_ID) {
      process.env.RAZORPAY_KEY_ID = keyMatch[1].trim();
    }

    const secretMatch = trimmed.match(/^Test Key Secret\s*=\s*(.+)$/i);
    if (secretMatch && !process.env.RAZORPAY_KEY_SECRET) {
      process.env.RAZORPAY_KEY_SECRET = secretMatch[1].trim();
    }
  }
}

module.exports = { loadRazorEnv };
