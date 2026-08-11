/**
 * Product page routes, rendered from lib/catalog.js.
 *
 * Adding a segment = adding an entry to SEGMENTS in the catalogue. The page,
 * the nav entry and the pricing block all follow. Register the new path in
 * lib/seo.js PAGES so it enters the sitemap.
 */

const C = require('./catalog');
const R = require('./render');
const { inr } = C;

const disclaimer = `<div class="card mt-10" style="background:#efe6dc">
  <h3 class="font-bold text-base text-primary mb-3">What the price does and does not cover</h3>
  <p class="text-sm text-on-surface-variant leading-relaxed">The monthly subscription covers the RentCan platform, your records, coordination and the scheduled monthly inspection. It does <strong>not</strong> cover the cost of repairs, materials, or the vendors who do the work — those are quoted and approved by you before anything happens. Additional and emergency visits are charged separately.</p>
</div>`;

/** Segment page bodies. */
function segmentBody(seg) {
  const parts = [];

  parts.push(R.heading('Who this is for', 'Built for these properties'));
  parts.push(R.checkList(seg.audience));

  if (seg.pricing === 'plans') {
    parts.push('<div class="mt-16">' + R.heading('Pricing', 'Pick your property size', 'One flat monthly fee. No percentage of your rent, no lock-in.') + R.planCards() + '</div>');
    parts.push('<div class="mt-16">' + R.heading('Included every month', 'What you get') + R.checkList(C.RESIDENTIAL_INCLUDED) + '</div>');
    parts.push('<div class="mt-16">' + R.heading('Extra visits', 'When you need someone sooner', 'Your plan includes one scheduled inspection a month. If you need more:') + R.extraVisits() + '</div>');
    parts.push(disclaimer);
  }

  if (seg.pricing === 'airbnb') {
    parts.push('<div class="mt-16">' + R.heading('Setup', 'Get the property listed properly', 'One-time setup to get your property ready, listed and running.') + R.airbnbPricing() + '</div>');
  }

  if (seg.features) {
    parts.push('<div class="mt-16">' + R.heading('What RentCan does', 'On the ground and on the record') + R.checkList(seg.features) + '</div>');
  }

  if (seg.id === 'buildings') {
    parts.push(`<div class="mt-16">
${R.heading('QR reporting', 'A resident finds a problem. Thirty seconds later it is a ticket.', 'No app to install. No one has to learn anything.')}
<div class="card">
  <ol class="text-on-surface-variant leading-relaxed" style="list-style:decimal;padding-left:20px">
    <li class="mb-2">Resident scans the QR code on the wall</li>
    <li class="mb-2">Picks a category — plumbing, electrical, AC, cleaning, security, damage, common area, emergency</li>
    <li class="mb-2">Adds a short description and a photo or video</li>
    <li class="mb-2">Submits</li>
    <li>A RentCan ticket is created, assigned and tracked to completion</li>
  </ol>
</div>
</div>`);
  }

  if (seg.pricing === 'sales') {
    parts.push(`<div class="mt-16">
${R.heading('Pricing', 'Quoted for your property')}
<div class="card">
  <p class="price" style="font-size:26px">Talk to Sales</p>
  <p class="text-on-surface-variant mt-3 leading-relaxed">${R.esc(seg.pricingNote)}</p>
  <div class="mt-6">${R.cta(seg.waPlan, 'Talk to Sales')}</div>
</div>
</div>`);
  } else {
    parts.push(`<div class="mt-14">${R.cta(seg.waPlan, seg.cta)}</div>`);
  }

  return parts.join('\n\n');
}

function segmentPage(seg) {
  return R.page({
    path: seg.slug,
    title: seg.title,
    description: seg.description,
    h1: seg.h1,
    lede: seg.lede,
    eyebrow: seg.name,
    body: segmentBody(seg)
  });
}

/** /platform — the software, framed as the record of the physical work. */
function platformPage() {
  const modules = C.PLATFORM_MODULES.map(m => `<div class="card">
    <h3 class="font-bold text-base text-primary mb-2">${R.esc(m.name)}</h3>
    <p class="text-sm text-on-surface-variant leading-relaxed">${R.esc(m.blurb)}</p>
  </div>`).join('\n  ');

  const body = `${R.heading('The platform', 'The dashboard is not the product', 'The visit is the product. The platform is how you see it — what was found, what it looked like, what it cost and what happened next.')}

<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
  ${modules}
</div>

<div class="mt-16">
${R.heading('Property history', 'Everything that has happened, on one timeline', 'You should not have to scroll through months of WhatsApp to find out when the leak was fixed.')}
<div class="card">
  <div class="check-item"><span class="check-icon">event</span><span><strong>11 Aug</strong> — Monthly inspection completed · 12 photos · Condition: Good</span></div>
  <div class="check-item"><span class="check-icon">report</span><span><strong>14 Aug</strong> — Bathroom leakage reported by tenant · photo attached</span></div>
  <div class="check-item"><span class="check-icon">search</span><span><strong>15 Aug</strong> — RentCan inspection completed · 3 photos · issue confirmed</span></div>
  <div class="check-item"><span class="check-icon">check_circle</span><span><strong>16 Aug</strong> — Repair completed · before/after photos · ${inr(1250)}</span></div>
</div>
<p class="text-sm text-on-surface-variant mt-4 leading-relaxed">Illustrative example of a property timeline.</p>
</div>

<div class="mt-16">
${R.heading('Approvals', 'Approve a repair from your phone')}
<div class="card">
  <p class="text-sm font-bold text-primary mb-3" style="letter-spacing:.1em">REPAIR APPROVAL REQUIRED</p>
  <p class="text-on-surface-variant leading-relaxed">AC repair · Sector 79 · Estimated ${inr(3200)}<br>Inspection photos attached.</p>
  <p class="text-sm text-on-surface-variant mt-4">You approve, decline, or ask a question. Nothing is spent without you saying yes.</p>
</div>
</div>

<div class="mt-16">
${R.heading('WhatsApp', 'We come to you, not the other way around', 'You get a WhatsApp message when something happens, with a link straight to the page that matters. You are not forced to live inside a dashboard.')}
${R.checkList(['Monthly inspection completed', 'Maintenance request received', 'Repair approval required', 'Inspection due tomorrow', 'Repair completed — before/after photos available'])}
</div>

<div class="mt-14">${R.cta('general', 'Manage My Property')}</div>`;

  return R.page({
    path: '/platform',
    title: 'The RentCan Platform — Inspections, Maintenance & History',
    description: 'The RentCan platform is the record of the on-ground work: inspections with photos, maintenance tickets, owner approvals, documents and a permanent property timeline.',
    h1: 'Your property.<br>On the record.',
    lede: 'Every inspection, issue, repair and photograph in one place — so you can see what has happened to your property without asking anyone.',
    eyebrow: 'The RentCan Platform',
    body
  });
}

/** /pricing — everything in one place. */
function pricingPage() {
  const salesRows = C.SEGMENTS.filter(s => s.pricing === 'sales')
    .map(s => `<div class="card">
    <h3 class="font-bold text-base text-primary mb-2">${R.esc(s.name)}</h3>
    <p class="price" style="font-size:22px">Talk to Sales</p>
    <p class="text-sm text-on-surface-variant mt-3 leading-relaxed">${R.esc(s.pricingNote)}</p>
    <a href="${s.slug}" class="text-sm font-semibold text-primary mt-4 inline-block">${R.esc(s.name)} &rarr;</a>
  </div>`).join('\n  ');

  const addons = C.ADDON_SERVICES.map(g => `<div class="card">
    <h3 class="font-bold text-base text-primary mb-3">${R.esc(g.group)}</h3>
    ${g.items.map(i => `<div class="check-item"><span class="check-icon">check</span><span class="text-sm">${R.esc(i)}</span></div>`).join('\n    ')}
  </div>`).join('\n  ');

  const body = `${R.heading('Homes & Kothis', 'Residential plans', 'One flat monthly fee based on the size of your property. No percentage of your rent, no lock-in.')}
${R.planCards()}

<div class="mt-10">${R.heading('Included in every plan', 'What the monthly fee covers')}${R.checkList(C.RESIDENTIAL_INCLUDED)}</div>

<div class="mt-16">${R.heading('Extra visits', 'Beyond the monthly inspection')}${R.extraVisits()}</div>

${disclaimer}

<div class="mt-16">${R.heading('Airbnb & Hospitality', 'Setup and management')}${R.airbnbPricing()}</div>

<div class="mt-16">
${R.heading('Quoted individually', 'Priced for the property')}
<div class="grid sm:grid-cols-2 gap-5">
  ${salesRows}
  <div class="card">
    <h3 class="font-bold text-base text-primary mb-2">${R.esc(C.ENTERPRISE.name)}</h3>
    <p class="price" style="font-size:22px">Talk to Sales</p>
    <p class="text-sm text-on-surface-variant mt-3 leading-relaxed">${R.esc(C.ENTERPRISE.blurb)}</p>
  </div>
</div>
</div>

<div class="mt-16">
${R.heading('Add-ons', 'Optional specialist services', 'Separate from the property plans, so the core pricing stays simple. Scoped and quoted on request.')}
<div class="grid sm:grid-cols-2 gap-5">
  ${addons}
</div>
</div>

<div class="mt-14">${R.cta('general', 'Talk to RentCan')}</div>`;

  return R.page({
    path: '/pricing',
    title: 'Property Management Pricing, Mohali & Chandigarh | RentCan',
    description: 'RentCan pricing — residential from ₹1,499/month, Airbnb setup from ₹9,999, full Airbnb management at 15% of booking revenue. Commercial quoted individually.',
    h1: 'What it costs.<br>All of it.',
    lede: 'Flat monthly fees for homes. Quoted pricing for buildings, commercial and hospitality. Repairs and vendor costs are always separate and always approved by you first.',
    eyebrow: 'Pricing',
    body
  });
}

/** Wire every product route onto the Express app. */
function register(app) {
  C.SEGMENTS.forEach((seg) => {
    const html = segmentPage(seg);
    app.get(seg.slug, (req, res) => res.type('html').send(html));
  });
  const platform = platformPage();
  const pricing = pricingPage();
  app.get('/platform', (req, res) => res.type('html').send(platform));
  app.get('/pricing', (req, res) => res.type('html').send(pricing));
}

module.exports = { register, segmentPage, platformPage, pricingPage };
