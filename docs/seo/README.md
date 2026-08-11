# RentCan SEO — technical foundation

Everything technical lives in **`lib/seo.js`** and is verified by **`scripts/seo-audit.js`**.

```bash
npm run dev          # terminal 1
npm run seo:audit    # terminal 2 — exits non-zero on any failure
```

After deploying: `npm run seo:audit:prod`

---

## Why the SEO layer is in Express and not `vercel.json`

`vercel.json` uses the legacy `builds` + `routes` config. **Vercel ignores the
`headers`, `redirects`, `cleanUrls` and `trailingSlash` blocks whenever `routes`
is present.** All four security headers declared in `vercel.json` have never been
sent in production. Confirmed:

```bash
curl -sI https://rentcan.in/    # no X-Frame-Options, no X-Content-Type-Options, ...
```

Since every request already passes through `server.js`, Express is the one layer
that reliably owns these responses. `lib/seo.js` is now the single source of truth.

`vercel.json`'s dead `headers`/`redirects` blocks were left in place — they are
inert, not harmful, and the `.html → clean URL` redirects they describe are
already implemented in `server.js`. Remove them only as part of a deliberate
migration off `builds`/`routes`.

---

## What changed

| # | Change | File | Why |
|---|---|---|---|
| 1 | CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, COOP, HSTS preload on every response | `lib/seo.js` → `securityHeaders` | The declared headers were never being sent. A brand-new domain with zero security headers is a plausible mechanical cause of the "no category" filter block. |
| 2 | `www.rentcan.in` → 301 → `rentcan.in` | `lib/seo.js` → `canonicalHost` | Both hosts answered 200 with identical content. API paths are exempt so a 301 can never downgrade a payment/OTP POST to a GET. |
| 3 | `/info/` → 301 → `/info` | `lib/seo.js` → `canonicalHost` | Trailing-slash variants were two URLs. |
| 4 | `X-Robots-Tag: noindex, nofollow` on all 8 app routes + `/api/` | `lib/seo.js` → `robotsTagForPrivateRoutes` | robots.txt `Disallow` stops *crawling*, not *indexing*. Google can still index a blocked URL from links alone. The header is the actual control. |
| 5 | `sitemap.xml` generated from the `PAGES` registry | `lib/seo.js` → `buildSitemap`, route in `server.js` | The static file listed `/info#pricing` and `/info#refunds` — fragments are not URLs. Generation makes "in the sitemap" and "is indexable" the same fact, so they cannot drift. |
| 6 | `robots.txt` rewritten | `public/robots.txt` | Explicit `Allow:` for `/css/`, `/js/`, `/assets/` so crawlers can render the page as a user sees it. |
| 7 | Homepage + `/info` title & meta description rewritten | `public/index.html`, `public/info.html` | Both were over SERP truncation length and led with the brand. Nobody searches "RentCan" yet, so the category term now leads. |
| 8 | `scripts/seo-audit.js` | new | 44 assertions. Deploy gate. |

**To add a page:** add one entry to `PAGES` in `lib/seo.js`. Sitemap, noindex
behaviour and audit coverage all follow automatically.

---

## Known limitation: the CSP is weak on purpose

The policy carries `'unsafe-inline'` and `'unsafe-eval'` because the site
currently requires both:

- **`unsafe-eval`** — `cdn.tailwindcss.com` is the Tailwind **Play CDN**, a
  runtime JIT compiler. It is not built for production; it also prints a console
  warning on every page load.
- **`unsafe-inline`** — the pages carry 24 inline `<script>` blocks and ~65
  inline `style` attributes.

So this CSP does **not** meaningfully stop XSS. What it does buy — and what
reputation and security scanners actually check — is `frame-ancestors`,
`object-src 'none'`, `base-uri`, `form-action` lockdown, and
`upgrade-insecure-requests`.

Replacing the Tailwind CDN with a compiled stylesheet is the single change that
unlocks a strict CSP **and** removes a render-blocking third-party script from
the LCP path. It is the highest-value remaining technical item.

> Gotcha found by browser testing, worth keeping: the `use.typekit.net`
> stylesheet chain-loads a second one from `p.typekit.net`, which appears
> nowhere in the HTML source. Any CSP change must be verified in a real browser,
> not by grepping the markup.

---

## Not yet done

The technical foundation is complete. The **content surface is not**: the site
still has only **3 indexable URLs** (`/`, `/info`, `/investors`), so most search
demand has nowhere to land. Still open:

- Keyword research — no data. Search volume, difficulty, SERP and competitor
  figures are **RESEARCH REQUIRED**; none should be written down until pulled
  from a real tool.
- Service pages (property management, rent collection, maintenance,
  inspections, commercial, Airbnb management/setup).
- Location pages + the uniqueness gate that must precede them.
- Sector geography — must be verified against authoritative sources before any
  page is generated. Do not assume a sector number exists.
- Free tools (rent receipt generator, rental ROI calculator).
- Google Business Profile, Search Console, Bing Webmaster Tools.
- `Organization.email` in the JSON-LD is a personal Gmail
  (`hundalg968@gmail.com`). An `@rentcan.in` address is materially stronger for
  entity trust and domain categorisation.
