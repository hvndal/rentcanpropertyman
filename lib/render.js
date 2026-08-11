/**
 * Server-rendered page shell for the RentCan product pages.
 *
 * Deliberately reuses the existing markup and class names (rc-site-header,
 * rc-brand-logo, card, section-label, badge, brand.css tokens) so these pages
 * are visually native to the hand-built pages rather than a second design
 * system. Nothing here introduces a build step.
 */

const C = require('./catalog');
const { inr } = C;

const esc = (s) => String(s).replace(/&(?![a-z]+;|#)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const ORIGIN = 'https://rentcan.in';

function nav(active) {
  const links = C.NAV_LINKS.map(l =>
    `<a href="${l.href}" class="rc-site-nav-link${l.href === active ? ' is-active' : ''}">${esc(l.label)}</a>`
  ).join('\n      ');

  return `<header class="rc-site-header">
  <div class="rc-site-nav-bar">
    <div class="rc-site-nav-brand">
      <a href="/" class="rc-brand-logo rc-brand-logo--ghost rc-brand-logo--nav">
        <img src="/assets/logos/rentcan-wordmark-transparent.png" alt="RentCan">
      </a>
    </div>
    <nav class="rc-site-nav-links" aria-label="Main">
      ${links}
    </nav>
    <div class="rc-site-nav-actions">
      <a href="#" data-wa-plan="general" class="px-5 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-container transition-colors">Talk to RentCan</a>
    </div>
  </div>
</header>`;
}

function footer() {
  const links = C.NAV_LINKS
    .concat([{ href: '/info', label: 'Services' }, { href: '/investors', label: 'Investors' }])
    .map(l => `<a href="${l.href}" class="hover:text-primary transition-colors">${esc(l.label)}</a>`)
    .join('\n      ');

  return `<footer class="bg-brand-cream border-t border-outline-variant py-10 mt-10">
  <div class="max-w-6xl mx-auto px-6 md:px-16 flex flex-col md:flex-row items-center justify-between gap-4">
    <a href="/" class="rc-brand-logo rc-brand-logo--light rc-brand-logo--footer no-underline">
      <img src="/assets/logos/rentcan-wordmark-transparent.png" alt="RentCan">
    </a>
    <p class="text-sm text-on-surface-variant">&copy; 2026 RentCan. On-ground property management across the Tricity.</p>
    <div class="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-on-surface-variant">
      ${links}
    </div>
  </div>
</footer>`;
}

/** Breadcrumb + Service schema. Only one business entity, ever. */
function schema({ path, name, description }) {
  const graph = [{
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: ORIGIN + '/' },
      { '@type': 'ListItem', position: 2, name, item: ORIGIN + path }
    ]
  }, {
    '@type': 'Service',
    name,
    description,
    serviceType: name,
    provider: { '@id': ORIGIN + '/#organization' },
    areaServed: ['Mohali', 'Chandigarh', 'Panchkula', 'Zirakpur', 'Kharar', 'New Chandigarh', 'Aerocity']
  }];
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2);
}

function page({ path, title, description, h1, lede, eyebrow, body }) {
  return `<!DOCTYPE html>
<html class="rc-js" lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${ORIGIN}${path}">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/seo/favicon-32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#6B4822">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_IN">
<meta property="og:site_name" content="RentCan">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${ORIGIN}${path}">
<meta property="og:image" content="${ORIGIN}/assets/seo/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="RentCan — on-ground property management across the Chandigarh Tricity">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${ORIGIN}/assets/seo/og-image.jpg">
<script type="application/ld+json">
${schema({ path, name: h1.replace(/<br>/g, ' ').replace(/&[a-z]+;/g, ''), description })}
</script>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block" rel="stylesheet">
<script src="https://cdn.tailwindcss.com?plugins=forms"></script>
<script src="/js/tailwind-brand.config.js"></script>
<link rel="stylesheet" href="/styles.css">
<link rel="stylesheet" href="/css/brand.css">
<style>
  body { font-family: 'Plus Jakarta Sans', sans-serif; }
  .card { background: var(--rc-warm-white, #fffcf8); border: 1px solid var(--rc-border, rgba(92,58,46,.14)); border-radius: 16px; padding: 28px; transition: transform .35s cubic-bezier(.16,1,.3,1), box-shadow .35s ease; }
  .card:hover { box-shadow: 0 12px 32px rgba(61,38,30,.1); transform: translateY(-3px); }
  .section-label { font-size: 11px; letter-spacing: .3em; text-transform: uppercase; font-weight: 700; color: #6B4822; }
  .check-item { display: flex; align-items: flex-start; gap: 10px; padding: 6px 0; }
  .check-icon { color: #6B4822; font-size: 18px; flex-shrink: 0; margin-top: 1px; font-family: 'Material Symbols Outlined'; }
  .rc-site-nav-link.is-active { color: #6B4822; font-weight: 700; }
  .price { font-size: 34px; font-weight: 800; color: #6B4822; letter-spacing: -.02em; }
  .price-unit { font-size: 14px; font-weight: 500; color: #6b5a52; }
  * { -webkit-tap-highlight-color: transparent; }
  button, a { touch-action: manipulation; }
</style>
</head>
<body class="bg-background text-on-surface rc-brand">

${nav(path)}

<section class="bg-primary text-white py-24 md:py-32 px-6 md:px-16">
  <div class="max-w-5xl mx-auto">
    ${eyebrow ? `<span class="text-accent text-xs font-bold uppercase tracking-[0.3em] mb-4 block">${esc(eyebrow)}</span>` : ''}
    <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.15] mb-8">${h1}</h1>
    <p class="text-white/70 text-lg max-w-2xl leading-relaxed">${esc(lede)}</p>
  </div>
</section>

<main class="max-w-5xl mx-auto px-6 md:px-16 py-16">
${body}
</main>

${footer()}
<script src="/js/site.js" defer></script>
</body>
</html>
`;
}

// ── Reusable section builders ───────────────────────────────────────────────

const checkList = (items) => `<div class="grid sm:grid-cols-2 gap-x-8">
  ${items.map(i => `<div class="check-item"><span class="check-icon">check</span><span>${esc(i)}</span></div>`).join('\n  ')}
</div>`;

const heading = (label, title, sub) => `<span class="section-label mb-3 block">${esc(label)}</span>
<h2 class="text-3xl md:text-4xl font-bold text-primary mb-3 tracking-tight">${esc(title)}</h2>
${sub ? `<p class="text-on-surface-variant max-w-2xl mb-10 leading-relaxed">${esc(sub)}</p>` : ''}`;

const cta = (waPlan, label) =>
  `<a href="#" data-wa-plan="${waPlan}" class="inline-block px-7 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-container transition-colors">${esc(label)}</a>`;

/** Residential plan cards. */
function planCards() {
  return `<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
  ${C.RESIDENTIAL_PLANS.map(p => `<div class="card">
    <h3 class="font-bold text-lg text-primary mb-2">${esc(p.name)}</h3>
    ${p.price
      ? `<p class="price">${inr(p.price)}<span class="price-unit">${esc(p.unit)}</span></p>`
      : `<p class="price" style="font-size:22px">Talk to Sales</p>`}
    <p class="text-sm text-on-surface-variant mt-3 leading-relaxed">${esc(p.inspection)}</p>
  </div>`).join('\n  ')}
</div>
<p class="text-sm text-on-surface-variant mt-6 leading-relaxed">Inspection scope scales with the property. Reports are observational property-condition reports — they are not engineering or legal certification.</p>`;
}

/** Airbnb setup tiers + management. */
function airbnbPricing() {
  return `<div class="grid sm:grid-cols-3 gap-5">
  ${C.AIRBNB_SETUP.map(t => `<div class="card">
    <h3 class="font-bold text-lg text-primary mb-2">${esc(t.name)}</h3>
    <p class="price">${t.from ? 'from ' : ''}${inr(t.price)}</p>
    <p class="price-unit mb-4 block">${esc(t.unit)}</p>
    ${t.includes.map(i => `<div class="check-item"><span class="check-icon">check</span><span class="text-sm">${esc(i)}</span></div>`).join('\n    ')}
  </div>`).join('\n  ')}
</div>

<div class="card mt-8">
  <h3 class="font-bold text-lg text-primary mb-2">Full Airbnb Management</h3>
  <p class="price">${C.AIRBNB_MANAGEMENT.rate}<span class="price-unit"> ${esc(C.AIRBNB_MANAGEMENT.basis)}</span></p>
  <p class="text-sm text-on-surface-variant mt-2 mb-5">Minimum ${inr(C.AIRBNB_MANAGEMENT.minimum)}/month per property. Villas, large properties and portfolios are quoted individually.</p>
  ${checkList(C.AIRBNB_MANAGEMENT.includes)}
</div>

<p class="text-sm text-on-surface-variant mt-6 leading-relaxed">Setup prices are starting prices. Furniture, appliances, decor, linens, major repairs and professional photography production are quoted separately.</p>`;
}

/** Visit pricing beyond the included monthly inspection. */
function extraVisits() {
  return `<div class="grid sm:grid-cols-3 gap-5">
  ${C.EXTRA_VISITS.map(v => `<div class="card">
    <h3 class="font-bold text-base text-primary mb-2">${esc(v.name)}</h3>
    <p class="price" style="font-size:26px">${v.from ? 'from ' : ''}${inr(v.price)}</p>
    <p class="text-sm text-on-surface-variant mt-2">${esc(v.note)}</p>
  </div>`).join('\n  ')}
</div>`;
}

module.exports = { page, checkList, heading, cta, planCards, airbnbPricing, extraVisits, esc, nav, footer };
