/**
 * Razorpay helpers — key_secret stays server-only.
 */
const crypto = require('crypto');
const Razorpay = require('razorpay');

function getKeyId() {
  return (process.env.RAZORPAY_KEY_ID || '').trim();
}

function getKeySecret() {
  return (process.env.RAZORPAY_KEY_SECRET || '').trim();
}

function isRazorpayReady() {
  return Boolean(getKeyId() && getKeySecret());
}

function getRazorpayClient() {
  if (!isRazorpayReady()) return null;
  return new Razorpay({
    key_id: getKeyId(),
    key_secret: getKeySecret()
  });
}

function verifyPaymentSignature({ orderId, paymentId, signature }) {
  const secret = getKeySecret();
  if (!secret || !orderId || !paymentId || !signature) return false;
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'utf8'),
      Buffer.from(String(signature), 'utf8')
    );
  } catch (_) {
    return false;
  }
}

function getWebhookSecret() {
  return (process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || '').trim();
}

function verifyWebhookSignature(rawBody, signature) {
  const secret = getWebhookSecret();
  if (!secret || !signature || rawBody == null) return false;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(typeof rawBody === 'string' ? rawBody : Buffer.from(rawBody))
    .digest('hex');
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'utf8'),
      Buffer.from(String(signature), 'utf8')
    );
  } catch (_) {
    return false;
  }
}

module.exports = {
  getKeyId,
  getKeySecret,
  isRazorpayReady,
  getRazorpayClient,
  verifyPaymentSignature,
  verifyWebhookSignature
};
