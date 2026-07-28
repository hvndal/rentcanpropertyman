/**
 * MSG91 server-side helpers — secrets stay on the server only.
 * Widget verifyAccessToken: https://control.msg91.com/api/v5/widget/verifyAccessToken
 */
const https = require('https');

const VERIFY_PATH = '/api/v5/widget/verifyAccessToken';
const REQUEST_TIMEOUT_MS = 15000;

function getServerAuthKey() {
  return (process.env.MSG91_AUTH_KEY || '').trim();
}

function httpsJson(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (apiRes) => {
      let data = '';
      apiRes.on('data', (chunk) => { data += chunk; });
      apiRes.on('end', () => {
        try {
          resolve({
            status: apiRes.statusCode,
            json: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({ status: apiRes.statusCode, json: null, parseError: true });
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(REQUEST_TIMEOUT_MS, () => {
      req.destroy(new Error('MSG91 request timed out'));
    });
    if (body) req.write(body);
    req.end();
  });
}

function isLikelyJwt(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  return parts.length === 3 && parts.every((p) => p.length > 0);
}

/**
 * Verify JWT returned by MSG91 OTP widget after successful verifyOtp.
 * Uses MSG91_AUTH_KEY only — never expose this key to the browser.
 */
async function verifyWidgetAccessToken(accessToken) {
  const authkey = getServerAuthKey();
  if (!authkey) {
    return {
      ok: false,
      code: 'MSG91_AUTH_KEY_MISSING',
      message: 'MSG91 server auth is not configured.'
    };
  }

  const token = String(accessToken || '').trim();
  if (!isLikelyJwt(token)) {
    return {
      ok: false,
      code: 'INVALID_ACCESS_TOKEN',
      message: 'Invalid verification token.'
    };
  }

  const result = await httpsJson({
    method: 'POST',
    hostname: 'control.msg91.com',
    path: VERIFY_PATH,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
  }, JSON.stringify({
    authkey,
    'access-token': token
  }));

  const parsed = result.json || {};
  const type = String(parsed.type || '').toLowerCase();
  const message = parsed.message || parsed.msg || '';

  if (result.status === 401 || result.status === 403 || type === 'error') {
    return {
      ok: false,
      code: 'MSG91_VERIFY_REJECTED',
      message: message || 'OTP verification could not be confirmed.',
      status: result.status
    };
  }

  const ok = type === 'success'
    || /success|verified/i.test(String(message))
    || (result.status >= 200 && result.status < 300 && type !== 'error');

  if (!ok) {
    return {
      ok: false,
      code: 'MSG91_VERIFY_FAILED',
      message: message || 'OTP verification failed.',
      status: result.status
    };
  }

  return {
    ok: true,
    message: message || 'verified',
    status: result.status,
    data: parsed
  };
}

/** Normalize phone from MSG91 payload if present */
function extractVerifiedPhone(payload) {
  const raw = payload?.mobile
    || payload?.phone
    || payload?.data?.mobile
    || payload?.data?.phone
    || '';
  return String(raw).replace(/\D/g, '');
}

module.exports = {
  getServerAuthKey,
  verifyWidgetAccessToken,
  extractVerifiedPhone,
  isLikelyJwt
};
