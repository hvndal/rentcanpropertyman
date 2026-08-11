/**
 * RentCan product catalogue — the single source of truth for segments, plans,
 * pricing and platform modules.
 *
 * Pages, pricing tables, navigation, schema and the sitemap all render from
 * here, so a price exists in exactly one place. Change it here, it changes
 * everywhere.
 *
 * Positioning rule this file encodes: RentCan is a property OPERATIONS company
 * powered by software. The physical visit is the product; the platform is the
 * record of it. Copy should read like a person in Mohali talking, not a SaaS
 * landing page.
 */

const WHATSAPP = '918146298024';

// ── Residential plans (Homes & Kothis) ──────────────────────────────────────
const RESIDENTIAL_PLANS = [
  { id: '1bhk',   name: '1 BHK',                        price: 1499, unit: '/month', inspection: 'Room-by-room condition check' },
  { id: '2bhk',   name: '2 BHK',                        price: 1799, unit: '/month', inspection: 'Room-by-room condition check' },
  { id: '3bhk',   name: '3 BHK',                        price: 2299, unit: '/month', inspection: 'Full room-by-room plus systems review' },
  { id: '4bhk',   name: '4 BHK / Large Apartment',      price: 2799, unit: '/month', inspection: 'Full room-by-room plus systems review' },
  { id: 'kothi',  name: 'Kothi / Independent House',    price: 3499, unit: '/month', inspection: 'Expanded: interior, exterior, floors, parking, access points, outdoor areas' },
  { id: 'estate', name: 'Large Estate',                 price: null, unit: '',       inspection: 'Scoped to the property', cta: 'Talk to Sales' }
];

// Included in every residential plan.
const RESIDENTIAL_INCLUDED = [
  'One scheduled property inspection every month',
  'Inspection report with photographs',
  'RentCan property dashboard',
  'Property profile and permanent history',
  'Tenant / occupant records',
  'Rent tracking',
  'Digital document storage',
  'Maintenance requests and issue tracking',
  'Maintenance coordination',
  'Owner notifications'
];

// Visits beyond the included monthly inspection.
const EXTRA_VISITS = [
  { id: 'additional', name: 'Additional scheduled inspection', price: 499, note: 'Booked in advance' },
  { id: 'urgent',     name: 'Urgent inspection',              price: 799, note: 'Same or next day, subject to availability' },
  { id: 'emergency',  name: 'Emergency / after-hours visit',  price: 999, from: true, note: 'Outside working hours' }
];

// ── Airbnb & Hospitality ────────────────────────────────────────────────────
const AIRBNB_SETUP = [
  {
    id: 'starter', name: 'Starter', price: 9999, from: true, unit: 'one-time',
    includes: ['Listing setup', 'Title and description', 'Amenity setup', 'House rules', 'Guest information', 'Basic pricing strategy', 'Check-in / check-out workflow']
  },
  {
    id: 'professional', name: 'Professional', price: 14999, from: true, unit: 'one-time',
    includes: ['Everything in Starter', 'Listing optimisation', 'Interior and styling recommendations', 'Photography planning', 'Amenity planning', 'Cleaning and maintenance workflow', 'Launch support']
  },
  {
    id: 'premium', name: 'Premium — Kothi / Villa', price: 24999, from: true, unit: 'one-time',
    includes: ['Everything in Professional', 'Property presentation and branding', 'Guest experience design', 'Full operational setup', 'Property readiness walkthrough']
  }
];

const AIRBNB_MANAGEMENT = {
  rate: '15%',
  basis: 'of monthly booking revenue',
  minimum: 2999,
  includes: [
    'Listing and calendar management', 'Pricing and occupancy monitoring', 'Booking management',
    'Guest communication and support', 'Check-in and check-out', 'Cleaning and turnover coordination',
    'Linen and inventory coordination', 'Property inspections', 'Maintenance coordination',
    'Guest reviews', 'Revenue reporting', 'Local on-ground support'
  ]
};

// ── The four customer segments ──────────────────────────────────────────────
const SEGMENTS = [
  {
    id: 'homes',
    slug: '/homes',
    nav: 'Homes & Kothis',
    name: 'Homes & Kothis',
    h1: 'Someone checks your home.<br>Every month.',
    lede: 'Flats, kothis and independent houses across the Tricity. A RentCan person visits your property every month, photographs what they find, and you see it the same day — wherever you are.',
    title: 'Property Management for Homes & Kothis in Mohali | RentCan',
    description: 'Monthly on-ground inspections, maintenance coordination and tenant support for 1–4 BHK flats and kothis in Mohali and the Tricity. From ₹1,499/month.',
    audience: ['1, 2, 3 and 4 BHK flats', 'Large apartments', 'Kothis and independent houses', 'NRI-owned homes', 'Rented-out family property', 'Locked or empty homes'],
    pricing: 'plans',
    waPlan: 'residential',
    cta: 'Manage My Property'
  },
  {
    id: 'buildings',
    slug: '/buildings',
    nav: 'Buildings & Communities',
    name: 'Buildings & Communities',
    h1: 'Your residents report it.<br>You see it get fixed.',
    lede: 'Apartment buildings, housing societies and gated communities. Residents scan a QR code to report an issue with a photo — no app to install. It becomes a ticket, a vendor is assigned, and the work is documented before and after.',
    title: 'Housing Society & Building Management, Mohali | RentCan',
    description: 'Housing society and building management in the Tricity — QR issue reporting, resident complaints, work orders, vendor coordination and inspections.',
    audience: ['Apartment buildings', 'Housing societies', 'Residential complexes', 'Gated communities', 'Multi-unit rental buildings', 'Co-living buildings'],
    features: [
      'Multiple buildings, floors and units', 'Resident and tenant records', 'Staff accounts with role-based access',
      'QR issue reporting — no app needed', 'Resident complaints and issue tracking', 'Work orders',
      'Vendor records and assignments', 'Common-area issue tracking', 'Scheduled inspections with photos',
      'Before / after evidence', 'Maintenance history', 'Property documents and reports'
    ],
    pricing: 'sales',
    pricingNote: 'Priced on units, buildings, residents, staff, inspection frequency, common areas and the on-ground support you need.',
    waPlan: 'general',
    cta: 'Talk to Sales'
  },
  {
    id: 'commercial',
    slug: '/commercial',
    nav: 'Commercial',
    name: 'Commercial Properties',
    h1: 'Your shop, office or godown.<br>Checked and documented.',
    lede: 'Offices, showrooms, warehouses and mixed-use property. Scheduled visits, tenant records, maintenance coordination and photo evidence of everything — so a commercial property you rarely visit does not quietly fall apart.',
    title: 'Commercial Property Management, Mohali & Chandigarh | RentCan',
    description: 'Commercial property management in the Tricity — offices, shops, showrooms and warehouses. Scheduled inspections, maintenance and photo evidence.',
    audience: ['Offices', 'Shops and showrooms', 'Warehouses and godowns', 'Commercial buildings', 'Mixed-use property', 'Clinics and institutions'],
    features: [
      'Property dashboard and records', 'Tenant records', 'Maintenance requests and complaints',
      'Scheduled inspections', 'Work orders', 'Vendor coordination', 'Photo evidence',
      'Property history', 'Documents', 'Owner and manager reporting', 'On-ground visits'
    ],
    pricing: 'sales',
    pricingNote: 'Priced on property type, size, number of units and how often you need someone on site.',
    waPlan: 'commercial',
    cta: 'Talk to Sales'
  },
  {
    id: 'airbnb',
    slug: '/airbnb',
    nav: 'Airbnb & Hospitality',
    name: 'Airbnb & Hospitality',
    h1: "You don't need to be in the city.<br>RentCan runs the property.",
    lede: 'Airbnb, villas, guesthouses and serviced apartments. We set the property up, list it properly, talk to your guests, coordinate every changeover and keep the place in shape — while you are somewhere else entirely.',
    title: 'Airbnb Management & Setup in Mohali, Chandigarh | RentCan',
    description: 'Airbnb management and setup in the Tricity — listing optimisation, guest communication, cleaning and turnover coordination. Setup from ₹9,999.',
    audience: ['Airbnb and short-term rentals', 'Villas and guesthouses', 'Serviced apartments', 'Vacation rentals', 'Hospitality property'],
    pricing: 'airbnb',
    waPlan: 'airbnb',
    cta: 'Explore Airbnb Management'
  }
];

// Hotels / large portfolios — deliberately not squeezed into a plan.
const ENTERPRISE = {
  name: 'Hotels, Large Properties & Portfolios',
  blurb: 'Hotels, large hospitality properties and multi-property portfolios are scoped individually. Rooms, staff, housekeeping issues, room and common-area inspections, equipment records and work orders.',
  cta: 'Talk to Sales'
};

// ── The platform (the record, not the pitch) ────────────────────────────────
const PLATFORM_MODULES = [
  { name: 'Inspections',      blurb: 'Scheduled visits with a checklist, observations, severity and photographs. Findings can raise a maintenance ticket directly.' },
  { name: 'Maintenance',      blurb: 'From reported to closed, with quotes, approvals, assigned vendors and before/after photos on every job.' },
  { name: 'Complaints',       blurb: 'Tenants and residents report issues with a photo. Nothing depends on remembering a WhatsApp message.' },
  { name: 'Property History', blurb: 'Every inspection, issue and repair on one permanent timeline. You can see what happened to the property months later.' },
  { name: 'Documents',        blurb: 'Rent agreements, leases, invoices, warranties and inspection reports in one place.' },
  { name: 'Photos & Evidence',blurb: 'Dated photographs from every visit and every repair — what it looked like before, and after.' },
  { name: 'Approvals',        blurb: 'Repair needed? You get the estimate and the photos, and approve or decline from your phone.' },
  { name: 'Reports',          blurb: 'Condition over time, open issues, spend and inspection history.' }
];

// ── Optional specialist services — kept out of the core plans ───────────────
const ADDON_SERVICES = [
  { group: 'Property & Interior', items: ['Interior design', 'Property styling', 'Property photography', 'Airbnb photography', 'Listing optimisation', 'Guest experience design'] },
  { group: 'Digital',             items: ['Website design & development', 'SEO', 'Google & Meta advertising', 'Digital marketing', 'Social media', 'Branding & logo design'] }
];

// ── Helpers ─────────────────────────────────────────────────────────────────
const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

const NAV_LINKS = SEGMENTS.map(s => ({ href: s.slug, label: s.nav }))
  .concat([{ href: '/platform', label: 'Platform' }, { href: '/pricing', label: 'Pricing' }]);

const getSegment = (id) => SEGMENTS.find(s => s.id === id) || null;

module.exports = {
  WHATSAPP, RESIDENTIAL_PLANS, RESIDENTIAL_INCLUDED, EXTRA_VISITS,
  AIRBNB_SETUP, AIRBNB_MANAGEMENT, SEGMENTS, ENTERPRISE,
  PLATFORM_MODULES, ADDON_SERVICES, NAV_LINKS, inr, getSegment
};
