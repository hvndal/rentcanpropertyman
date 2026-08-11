#!/usr/bin/env node
/**
 * RentCan SEO validation.
 *
 *   node scripts/seo-audit.js                     # audit local server (port 3000)
 *   node scripts/seo-audit.js https://rentcan.in  # audit production
 *
 * Exits non-zero on any FAIL, so it can gate a deploy.
 */

const BASE = (process.argv[2] || 'http://localhost:3000').replace(/\/+$/, '');
const { PAGES, INDEXABLE_PATHS, NOINDEX_PATHS } = require('../lib/seo');

let pass = 0, fail = 0, warn = 0;
const ok   = (m) => { pass++; console.log('  PASS  ' + m); };
const bad  = (m) => { fail++; console.log('  FAIL  ' + m); };
const meh  = (m) => { warn++; console.log('  WARN  ' + m); };
const head = (m) => console.log('\n=== ' + m + ' ===');

async function get(path, method = 'GET') {
  const res = await fetch(BASE + path, { method, redirect: 'manual' });
  const body = res.status < 300 || res.status >= 400 ? await res.text() : '';
  return { status: res.status, headers: res.headers, body, location: res.headers.get('location') };
}

const tag = (html, re) => { const m = html.match(re); return m ? m[1].trim() : null; };
const title = (h) => tag(h, /<title[^>]*>([\s\S]*?)<\/title>/i);
const desc  = (h) => tag(h, /<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["']/i);
const canon = (h) => tag(h, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
const h1s   = (h) => (h.match(/<h1[\s>]/gi) || []).length;
const ogImg = (h) => tag(h, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);

async function main() {
  console.log('RentCan SEO audit → ' + BASE);

  // ── Security headers ──────────────────────────────────────────────────────
  head('Security headers');
  const root = await get('/');
  const required = {
    'content-security-policy': null,
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'SAMEORIGIN',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'permissions-policy': null,
    'strict-transport-security': null
  };
  for (const [key, expected] of Object.entries(required)) {
    const got = root.headers.get(key);
    if (!got) bad(key + ' missing');
    else if (expected && got !== expected) bad(key + ' = "' + got + '" (expected "' + expected + '")');
    else ok(key);
  }

  // ── Indexable pages ───────────────────────────────────────────────────────
  head('Indexable pages');
  const titles = new Map(), descs = new Map();
  for (const path of INDEXABLE_PATHS) {
    const r = await get(path);
    if (r.status !== 200) { bad(path + ' returned ' + r.status + ' (must be 200)'); continue; }

    const t = title(r.body), d = desc(r.body), c = canon(r.body), n = h1s(r.body);

    if (!t) bad(path + ' has no <title>');
    else if (t.length > 65) meh(path + ' title is ' + t.length + ' chars (likely truncated in SERP)');
    else ok(path + ' title (' + t.length + ' chars)');

    if (!d) bad(path + ' has no meta description');
    else if (d.length > 165) meh(path + ' meta description is ' + d.length + ' chars');
    else ok(path + ' meta description (' + d.length + ' chars)');

    if (!c) bad(path + ' has no canonical');
    else {
      const expect = 'https://rentcan.in' + (path === '/' ? '/' : path);
      c === expect ? ok(path + ' self-canonical') : bad(path + ' canonical is ' + c + ' (expected ' + expect + ')');
    }

    if (n === 0) bad(path + ' has no <h1>');
    else if (n > 1) bad(path + ' has ' + n + ' <h1> elements');
    else ok(path + ' has exactly one <h1>');

    ogImg(r.body) ? ok(path + ' has og:image') : bad(path + ' has no og:image');

    if (/name=["']robots["'][^>]*noindex/i.test(r.body)) bad(path + ' is in the sitemap but carries meta noindex');
    if (r.headers.get('x-robots-tag')) bad(path + ' is indexable but sends X-Robots-Tag: ' + r.headers.get('x-robots-tag'));

    if (t) { if (titles.has(t)) bad('duplicate title: ' + path + ' and ' + titles.get(t)); else titles.set(t, path); }
    if (d) { if (descs.has(d)) bad('duplicate description: ' + path + ' and ' + descs.get(d)); else descs.set(d, path); }
  }

  // ── Private routes must be noindex ────────────────────────────────────────
  head('Private routes are noindex');
  for (const path of NOINDEX_PATHS) {
    const r = await get(path);
    const xr = r.headers.get('x-robots-tag') || '';
    xr.includes('noindex') ? ok(path + ' → X-Robots-Tag: ' + xr) : bad(path + ' is missing X-Robots-Tag: noindex');
  }

  // ── robots.txt ────────────────────────────────────────────────────────────
  head('robots.txt');
  const rob = await get('/robots.txt');
  if (rob.status !== 200) bad('robots.txt returned ' + rob.status);
  else {
    ok('robots.txt is 200');
    /Sitemap:\s*https:\/\/rentcan\.in\/sitemap\.xml/i.test(rob.body)
      ? ok('declares the sitemap') : bad('does not declare the sitemap');
    /Disallow:\s*\/\s*$/m.test(rob.body) ? bad('contains a blanket "Disallow: /"') : ok('no blanket disallow');
    for (const p of ['/css/', '/js/']) {
      new RegExp('Disallow:\\s*' + p).test(rob.body) ? bad('blocks ' + p + ' — breaks rendering') : ok('does not block ' + p);
    }
  }

  // ── sitemap.xml ───────────────────────────────────────────────────────────
  head('sitemap.xml');
  const sm = await get('/sitemap.xml');
  if (sm.status !== 200) bad('sitemap.xml returned ' + sm.status);
  else {
    ok('sitemap.xml is 200');
    (sm.headers.get('content-type') || '').includes('xml')
      ? ok('served as XML') : bad('content-type is ' + sm.headers.get('content-type'));

    const locs = [...sm.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    locs.length ? ok('contains ' + locs.length + ' URLs') : bad('contains no URLs');

    if (locs.some(l => l.includes('#'))) bad('contains fragment URLs (#) — not real URLs');
    else ok('no fragment URLs');

    if (new Set(locs).size !== locs.length) bad('contains duplicate URLs');
    else ok('no duplicate URLs');

    for (const loc of locs) {
      const path = loc.replace('https://rentcan.in', '') || '/';
      if (NOINDEX_PATHS.includes(path)) { bad(loc + ' is a private route but is in the sitemap'); continue; }
      const r = await get(path);
      r.status === 200 ? ok(loc + ' → 200') : bad(loc + ' → ' + r.status + ' (sitemap must contain only 200s)');
    }
  }

  // ── Canonicalisation ──────────────────────────────────────────────────────
  head('Canonicalisation');
  const slash = await get('/info/');
  slash.status === 301 ? ok('/info/ → 301 ' + slash.location) : meh('/info/ returned ' + slash.status + ' (expected 301)');

  const missing = await get('/definitely-not-a-real-page-' + Date.now());
  missing.status === 404 ? ok('unknown URL → real 404') : bad('unknown URL → ' + missing.status + ' (soft 404)');

  // ── Result ────────────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(52));
  console.log(`${pass} passed · ${warn} warnings · ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => { console.error('\nAudit could not run:', e.message); process.exit(2); });
