/**
 * RentCan — technical SEO + security header layer.
 *
 * Everything here runs inside server.js (the single Vercel function), NOT in
 * vercel.json. That is deliberate: vercel.json uses the legacy `builds` +
 * `routes` config, and Vercel ignores the `headers` / `redirects` / `cleanUrls`
 * blocks whenever `routes` is present. Those blocks have never applied in
 * production. Express is the only layer that reliably owns these responses.
 */

const CANONICAL_HOST = 'rentcan.in';
const CANONICAL_ORIGIN = 'https://' + CANONICAL_HOST;

/**
 * The single source of truth for what is public and what is indexable.
 * The sitemap, the noindex middleware and the audit script all read this, so
 * a page can never be "in the sitemap but noindexed" or vice versa.
 *
 * indexable:false  → X-Robots-Tag: noindex, excluded from sitemap
 * changefreq/priority are hints only; Google ignores them, Bing still reads them.
 */
const PAGES = [
  { path: '/',           file: 'index.html',       indexable: true,  changefreq: 'weekly',  priority: '1.0' },
  { path: '/info',       file: 'info.html',        indexable: true,  changefreq: 'weekly',  priority: '0.9' },
  { path: '/investors',  file: 'investors.html',   indexable: true,  changefreq: 'monthly', priority: '0.7' },

  // Application surface — public URLs, but never for the index.
  { path: '/login',      file: 'login.html',       indexable: false },
  { path: '/dashboard',  file: 'dashboard.html',   indexable: false },
  { path: '/documents',  file: 'documents.html',   indexable: false },
  { path: '/payments',   file: 'payments.html',    indexable: false },
  { path: '/inspections',file: 'inspections.html', indexable: false },
  { path: '/reports',    file: 'reports.html',     indexable: false },
  { path: '/admin',      file: 'admin.html',       indexable: false },
  { path: '/checkout',   file: 'checkout.html',    indexable: false }
];

const INDEXABLE_PATHS = PAGES.filter(p => p.indexable).map(p => p.path);
const NOINDEX_PATHS = PAGES.filter(p => !p.indexable).map(p => p.path);

/**
 * Content-Security-Policy.
 *
 * 'unsafe-inline' and 'unsafe-eval' are required today and are NOT decoration:
 *   - unsafe-eval : cdn.tailwindcss.com is the Play CDN, a runtime JIT compiler.
 *   - unsafe-inline: the pages carry 24 inline <script> blocks and ~65 inline
 *     style attributes.
 * So this policy does not stop XSS. What it does buy — and what domain
 * reputation scanners actually check for — is frame-ancestors (clickjacking),
 * object-src none, base-uri lockdown, form-action lockdown, and no plaintext
 * subresources. Removing the Tailwind CDN is what unlocks a strict policy;
 * see docs/seo/README.md.
 */
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://checkout.razorpay.com https://*.msg91.com",
  // p.typekit.net is chain-loaded by the use.typekit.net stylesheet at runtime;
  // it does not appear anywhere in the HTML source. Found by browser testing.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://use.typekit.net https://p.typekit.net https://cdn.jsdelivr.net",
  "font-src 'self' data: https://fonts.gstatic.com https://use.typekit.net https://p.typekit.net",
  "img-src 'self' data: blob: https:",
  "media-src 'self'",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.msg91.com https://api.razorpay.com https://lumberjack.razorpay.com",
  "frame-src https://checkout.razorpay.com https://api.razorpay.com https://*.msg91.com",
  "worker-src 'self'",
  "manifest-src 'self'",
  "upgrade-insecure-requests"
].join('; ');

/**
 * Security + crawler headers on every response.
 * These are the four headers vercel.json has been declaring but never sending,
 * plus CSP and HSTS preload.
 */
function securityHeaders(req, res, next) {
  res.setHeader('Content-Security-Policy', CSP);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  next();
}

/**
 * Host + path canonicalisation.
 *
 * www.rentcan.in currently answers 200 with a full copy of the site. The
 * canonical tag points home, which limits the damage, but two hosts serving
 * 200 is an unresolved duplicate. 301 the whole www host to the apex.
 * Also strips trailing slashes so /info/ and /info are not two URLs.
 */
function canonicalHost(req, res, next) {
  const host = String(req.headers.host || '').toLowerCase().split(':')[0];

  // Never redirect local dev or Vercel preview deployments.
  const isLocal = !host || host === 'localhost' || host.startsWith('127.') || host.endsWith('.local');
  const isPreview = host.endsWith('.vercel.app');

  // Never redirect the API: a 301 turns a POST into a GET and would silently
  // break payment / OTP calls made against the www host.
  if (req.path.startsWith('/api/')) return next();

  if (!isLocal && !isPreview && host && host !== CANONICAL_HOST) {
    return res.redirect(301, CANONICAL_ORIGIN + req.originalUrl);
  }

  // /info/ → /info  (never touch the root)
  if (req.path.length > 1 && req.path.endsWith('/')) {
    const query = req.originalUrl.slice(req.path.length);
    return res.redirect(301, req.path.replace(/\/+$/, '') + query);
  }

  next();
}

/**
 * robots.txt Disallow does NOT keep a URL out of the index — Google can still
 * index a blocked URL from links alone and show it with no snippet. The header
 * is the actual control, and it works because these routes are crawlable.
 */
function robotsTagForPrivateRoutes(req, res, next) {
  const path = req.path.replace(/\/+$/, '') || '/';
  if (NOINDEX_PATHS.includes(path) || path.startsWith('/api/')) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  }
  next();
}

/**
 * Builds sitemap.xml from PAGES at request time, so a page can never drift out
 * of sync with its indexability. Only indexable:true entries are emitted.
 * No fragment URLs (#pricing is not a URL), no redirects, no private routes.
 */
function buildSitemap(lastmod) {
  const stamp = lastmod || new Date().toISOString().slice(0, 10);
  const urls = PAGES.filter(p => p.indexable).map((p) => {
    const loc = CANONICAL_ORIGIN + (p.path === '/' ? '/' : p.path);
    return [
      '  <url>',
      '    <loc>' + loc + '</loc>',
      '    <lastmod>' + (p.lastmod || stamp) + '</lastmod>',
      '    <changefreq>' + (p.changefreq || 'monthly') + '</changefreq>',
      '    <priority>' + (p.priority || '0.5') + '</priority>',
      '  </url>'
    ].join('\n');
  });

  return '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + urls.join('\n') + '\n'
    + '</urlset>\n';
}

module.exports = {
  CANONICAL_HOST,
  CANONICAL_ORIGIN,
  PAGES,
  INDEXABLE_PATHS,
  NOINDEX_PATHS,
  CSP,
  securityHeaders,
  canonicalHost,
  robotsTagForPrivateRoutes,
  buildSitemap
};
