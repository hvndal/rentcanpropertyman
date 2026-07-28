/**
 * Simple in-memory rate limiter (per IP). Sufficient for single-instance / serverless warm instances.
 */
const buckets = new Map();

function rateLimit({ key, limit = 20, windowMs = 15 * 60 * 1000 }) {
  const now = Date.now();
  let entry = buckets.get(key);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + windowMs };
    buckets.set(key, entry);
  }
  entry.count += 1;
  if (entry.count > limit) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((entry.resetAt - now) / 1000)
    };
  }
  return { allowed: true, remaining: limit - entry.count };
}

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

module.exports = { rateLimit, clientIp };
