# PLAN.md — Relish Cakebox Website

## Goal
Build a mobile-first, handheld-primary Next.js App Router + Tailwind + TypeScript site for Relish Cakebox (Marangattupilly / Pala) that turns Instagram browsing into WhatsApp orders. Design phone-first (360px base), then scale up to desktop — never the reverse. No checkout, no payments. Every order path ends in a pre-filled `https://wa.me/919207843867?text=` message to the owner. The ONLY phone/WhatsApp number anywhere is +91 9207843867 (display `+91 92078 43867`). Theme locked: Earthy Terracotta on Cream (#FFF6E8), Fraunces headings + Inter body + Manjari for Malayalam words.

## Canonical Business Facts (owner-confirmed)
- Name: Relish Cakebox. Address as supplied: Pala, Marangattupally, Kottayam – 686635, Kerala, India. PIN code: 686635 (confirmed certain).
- Phone / WhatsApp (only number): 09207843867, displayed `+91 92078 43867`, wa.me `919207843867`.
- Location: Plus Code `PJH4+W8 Pala, Keralam`; coordinates 9.7298125, 76.6058125 (owner DMS 9°43'47.3"N 76°36'20.9"E). Google Maps: https://google.com/maps/place/Relish+Cakebox/@9.7270354,76.5956257,14.89z/data=!4m6!3m5!1s0x3b07d1862ca2bbf5:0x3cc064c010d4a65c!8m2!3d9.7298125!4d76.6058125!16s%2Fg%2F11td9736b8
- Use these exact values for footer, About, Bakery JSON-LD (`PostalAddress` + `geo`), Google Business Profile, JustDial, Bing Places and `llms.txt`. Visible HTML must match schema exactly.
- Still open before schema/GBP lock: locality spelling — brief says Marangattupilly, owner message says Marangattupally — must match the GBP listing byte-for-byte; also street line, opening hours, domain, price range confirmation.

## Success Criteria
- Visitor can design a cake and send it on WhatsApp in under 2 minutes, no confusion.
- Designer supports Fixed Menu Cake vs Custom Build toggle, shows fixed price OR range + line-by-line breakdown, correct per Admin values.
- Gallery shows real already-built cake photos from shared storage (not per-browser placeholders): every card AND every detail modal has photo + name + tag + starting price + working WhatsApp button with correct cake name.
- Owner can add/replace gallery photos from Admin `/relish` and every visitor sees them immediately (shared storage, not localStorage).
- Admin at `/relish` (PIN-gated, noindex, not in nav) edits fixed prices, custom formula, gallery, and settings; Designer and Gallery update immediately.
- Footer + About show FSSAI Lic. No. 21320166000450, WhatsApp +91 92078 43867, Instagram https://www.instagram.com/relish_cakebox/. No other phone number anywhere.
- Handheld-primary responsive: 360px base with zero horizontal scroll; 1 column on phones, max 2 columns on desktop; sticky bottom WhatsApp CTA on mobile on Designer/Gallery; tap targets 44px+; readable type (16px+ body, no zoom traps); Designer summary readable without sideways scroll; desktop only enhances (sticky side summary, wider grid) — no phone-only breakage.
- Anti-slop: no purple/blue gradients, no gradient text, no glassmorphism, no lorem/fake testimonials/fake stats/emoji bullets, no floating blobs, no extra button styles.

## Approach
- Greenfield Next.js App Router scaffold in the empty workspace root via `create-next-app --typescript --eslint --app --tailwind`. No `src/` dir, import alias `@/*`.
- Styling: Tailwind v4 CSS-first (`@import "tailwindcss"` in `app/globals.css`, `@tailwindcss/postcss` in `postcss.config.mjs`), CSS variables for the 9 locked tokens, Fraunces + Inter + Manjari via `next/font/google`. Responsive system: mobile-first utilities only (`flex-col` base, `md:` upgrades), `min-h-[44px]` tap targets, `max-w-full overflow-x-hidden` guards, responsive images (`w-full h-auto`, Blob URLs with width params), fluid type (`text-base` body, `text-2xl md:text-4xl` hero), 8pt spacing scale.
- Client-heavy pages (`designer`, `relish`) as Client Components; pure logic in `lib/pricing.ts` and `lib/whatsapp.ts` so it is unit-testable.
- Single WhatsApp constant (`WHATSAPP_NUMBER = "919207843867"`) used by every button; display `+91 92078 43867`.
- Shared storage (NEW — replaces localStorage-only plan):
  - Gallery photos: Vercel Blob public store. Owner uploads from `/relish`; images served by Blob CDN URL. Vercel Blob stores images and serves them publicly by URL through Vercel's CDN, with public stores readable by anyone with the URL.
  - Gallery/pricing/settings data: shared Postgres via Vercel Marketplace (e.g. Neon) — tables `gallery_cakes`, `fixed_prices`, `pricing_config`, `settings`. `lib/storage.ts` becomes the data-access layer over this DB; localStorage stays only as an offline/cache fallback, never the source of truth.
  - Alternative single-vendor option: Supabase (Postgres + Storage together; Free plan gives 2 free projects, pausable). Pick one provider at build start; code isolates it behind `lib/storage.ts` / `lib/db.ts` so switching later is contained.
  - Seed content: `public/cakes/` ships build-time fallback images with real cake names; Admin uploads replace them at runtime via Blob URLs.
- SEO/AEO/AIO/GEO ships with the build: Bakery JSON-LD with the canonical facts above, per-route metadata/canonical, `sitemap.ts` + `robots.ts` (allow OAI-SearchBot + PerplexityBot, block /relish + /api), FAQ answer-first blocks, `public/llms.txt` with name/address/WhatsApp/FSSAI/links. One GBP only; Pala/Kottayam are service areas.
- Reference-photo flow in Designer stays honest: file-input preview + link input + gallery pick; the WhatsApp message carries the Blob link/name only — never claim wa.me auto-attaches files.
- Admin is plain white/grey, separate from themed storefront.

## Steps
1. Scaffold + design system: `create-next-app`, `globals.css` tokens, `layout.tsx` (fonts, nav, footer with FSSAI/WhatsApp/Instagram, single number), `Navbar.tsx`, `Footer.tsx`, `WhatsAppButton.tsx`. Verify `npm run dev` boots.
2. Data + logic libs: `lib/cakes.ts` (8 real gallery entries), `lib/pricing.ts` (fixed lookup + custom formula + range), `lib/whatsapp.ts` (designer + gallery message builders with `encodeURIComponent`, single number constant), `lib/db.ts` + `lib/storage.ts` (DB access + Blob upload helpers + localStorage cache fallback). Pricing defaults below.
3. Storage wiring (Vercel): create Blob public store, connect to project (OIDC env vars auto-added), create Marketplace Postgres DB, add `DATABASE_URL` + `ADMIN_PIN` env vars in Vercel dashboard, add `/api/upload` + `/api/gallery` routes. Server `put` for small files; client `upload` with `handleUploadUrl` for files over the function body limit.
4. Home `/`: hero (name + "Custom cakes baked with love in Marangattupilly" + 2 CTAs), 3 featured cakes (from DB), 3-step How-it-works, 4.6 JustDial badge, FSSAI badge, delivery areas, Instagram + WhatsApp links (owner number only).
5. Designer `/designer`: 5-step flow (Occasion / Size+Shape+Kg / Flavour / Look photo-view / Date+Delivery) with progress bar, sticky summary desktop / below mobile, Fixed-vs-Custom toggle, breakdown, range, Send-on-WhatsApp + Copy + Edit. Size/shape matrix and theme/colour lists per brief.
6. Gallery `/gallery`: reads from DB, filters (All, Birthday, Wedding, Kids, Baptism, Anniversary, Table Sets), 8+ cards with photo/name/tag/starting-price, modal with bigger photo + sizes + WhatsApp button + "Customise in Designer" deep link (`/designer?cake=`).
7. Table Sets `/table-sets` + About `/about`: inclusions, base price from Admin/DB, contact-to-WhatsApp form (to owner number only).
8. Admin `/relish`: PIN gate (changeable via env, no demo hint in prod), tabs Dashboard / Fixed Prices / Custom Formula / Gallery (upload to Blob + CRUD rows) / Settings (shop info, delivery areas, advance days, variance). Live example calculation, `noindex,nofollow`, footer-only link.
9. SEO pass: metadata/canonical per route, Bakery JSON-LD validated, sitemap/robots verified, FAQ blocks, llms.txt, NAP audit against GBP/JustDial/Bing/Instagram.
10. Anti-slop + acceptance pass: checklist in Validation Plan, fix spacing/contrast/focus states/tap targets/alt text/labels.

### Pricing logic (defaults, all editable in Admin/DB)
- Custom: `estimate = basePerKg*kg + flavourExtraPerKg*kg + shapeExtra + themeExtra + deliveryFee`. Range = `estimate ± variance%` (default 15%).
- Defaults: base 800/kg; flavour extra: Truffle 200, Butterscotch 100, Red Velvet 250, Ferrero 300, Carrot&Dates 50, Vanilla 0, Pineapple 50, Black Forest 150; shape extra: Round 0, Square 100, Heart 150, Number 250, 2-Tier 500, 3-Tier 900; theme extra: Classic Roses 100, Wedding Floral 300, Mermaid 200, Bottle 250, Dosa Novelty 400, Dove 150, Heart Anniversary 100, Photo 200; delivery fee 100, free over 2000; variance 15%.
- Fixed: match on (cake name + kg) and Available=true → show `Fixed Price: Rs X` + "Fixed price for this standard cake". Seeds: Truffle 1kg 950, Butterscotch 1kg 900, Red Velvet 1kg 1050, Carrot&Dates 1kg 850, Wedding White 2kg 2200. Any theme/shape/text deviation flips to custom range.
- Example: 800×1 + 200×1 + Heart 150 + Roses 100 + delivery 100 = 1350 → Rs 1,148–1,553 at 15%.

### File list to create
- `app/layout.tsx`, `app/globals.css`, `app/page.tsx`, `app/designer/page.tsx`, `app/gallery/page.tsx`, `app/table-sets/page.tsx`, `app/about/page.tsx`, `app/relish/page.tsx`
- `app/api/upload/route.ts`, `app/api/gallery/route.ts` (+ pricing/settings routes as needed)
- `components/Navbar.tsx`, `Footer.tsx`, `CakeCard.tsx`, `DesignerSteps.tsx`, `PriceSummary.tsx`, `WhatsAppButton.tsx`
- `lib/pricing.ts`, `lib/whatsapp.ts`, `lib/storage.ts`, `lib/db.ts`, `lib/cakes.ts`
- `public/cakes/` seed images + `public/cakes/README.md`, `README.md` (run, Vercel Blob + DB setup, domain move), `PLAN.md` (this file)

## Validation Plan
- `npm run build` + `npm run lint` clean; Designer walkthrough (occasion→kg/shape→flavour→theme→date/delivery) → estimate matches Admin values; WhatsApp link contains all fields, uses ONLY `919207843867`, newlines encoded.
- Fixed cake → fixed price; tweaked theme/shape → range + breakdown lines.
- Gallery: upload a photo in `/relish` → appears for a fresh visitor (different browser/incognito) — proves shared storage. Every card + modal WhatsApp button opens wa.me with correct `[Cake Name]` to the owner number.
- Admin: change base price → Designer updates after reload; change fixed price → Gallery updates; reload persists via DB (localStorage is cache only).
- Reference photo: upload shows thumbnail, link input works, gallery pick loads into Designer.
- Handheld matrix: 360×640 and 390×844 viewports — no horizontal scroll, 1-column layouts, sticky bottom WhatsApp CTA reachable by thumb, radio cards / chips / inputs all 44px+ and full-width, gallery modal fits screen with close button tappable, Designer summary stacks below steps; desktop 1280px — 2-column grids, sticky side summary, same WhatsApp flow. Keyboard + visible focus + contrast AA + `prefers-reduced-motion` check on both.
- Content check: FSSAI + single WhatsApp +91 92078 43867 + Instagram + address/PIN/geo present in footer + About and identical in JSON-LD, llms.txt, GBP, JustDial; Maps link opens the Relish Cakebox pin; no trace of any other number; zero lorem, zero gradients, zero dead links.

## Risks / Open Questions
- Vercel Blob + Marketplace Postgres add accounts/costs beyond free hobby limits at scale — assumed fine for a bakery gallery; if the owner wants zero-backend, fallback is git-committed `public/cakes/` photos (redeploy per change, no Admin upload). Decision: ship Blob + DB as above.
- Real cake photos and final fixed prices not in brief — ship clearly-labelled seeds with real names; owner replaces via Admin uploads. No fake data invented beyond brief.
- WhatsApp cannot receive auto-attached files via wa.me — message tells buyer to attach reference photo after sending.
- Single number confirmed: only +91 9207843867 (owner-supplied 09207843867) everywhere; old `62357 47583` fully removed.
- Address/PIN/geo now owner-confirmed (686635; 9.7298125, 76.6058125; PJH4+W8). Remaining owner inputs: street line, locality spelling vs GBP, opening hours, domain, per-town delivery fee/advance days, eggless availability, price range.
- NRI + Malayalam needs: small Manjari words only; full Malayalam translation is a non-goal for v1.
- Vercel env needed: Blob store connection (OIDC vars auto-added), `DATABASE_URL`, `ADMIN_PIN`. No other secrets for v1.

## Sources
- https://vercel.com/docs/storage/vercel-blob
- https://supabase.com/pricing
- https://nextjs.org/docs/app/getting-started/installation
- https://tailwindcss.com/docs/installation/framework-guides/nextjs
