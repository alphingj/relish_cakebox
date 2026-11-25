# Relish Cakebox Website

Mobile-first Next.js site for Relish Cakebox, Marangattupilly / Pala. Every order ends on WhatsApp: +91 92078 43867.

## Run locally
```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```
Admin: open `/relish` and log in with the password set in `ADMIN_PIN`. No default password in production.

## Photos (no bundled images)
The site ships with **zero** photos and zero placeholder images. The gallery and homepage stay empty until the owner uploads real photos in Admin.

Accepted: JPG, PNG, WebP, AVIF, TIFF, and **iPhone HEIC/HEIF** (`IMG_1234.HEIC`).

Upload flow:
1. Admin → Gallery (or Site Content → hero / carousel / table set) → choose a photo.
2. In Chrome/Android the browser resizes it to a 1600 px long edge and converts it to WebP under 3.5 MB (`lib/image-client.ts`). HEIC cannot be decoded by canvas there, so it is sent untouched.
3. `POST /api/upload` re-encodes it with sharp: auto-rotates, fits inside 1600 px, lowers quality then dimensions until the file is **≤ 1.5 MB** WebP (`lib/image-server.ts`). HEIC is decoded first with libheif (`heic-decode`, wasm) because sharp's prebuilt libvips cannot read it.
4. The WebP is stored in a public Vercel Blob store and the CDN URL is saved in Postgres (`gallery_cakes.image`, `site_settings`).
5. Photos are served straight from the Blob CDN with `next/image` `unoptimized` (they are already normalised).

A cake without a photo is hidden from the gallery and homepage. Limits live in `lib/image-client.ts` / `lib/image-server.ts` if they need changing.

## Environment
See `.env.example`. Required in production:
- `ADMIN_PIN` — admin password.
- `DATABASE_URL` — Postgres (Neon via Vercel Marketplace) for gallery, prices and site content.
- Vercel Blob store — connected to the project (Vercel injects OIDC credentials). Locally use `BLOB_READ_WRITE_TOKEN` from the store.
- `NEXT_PUBLIC_SITE_URL` — your domain, used by metadata, sitemap, robots.

Full step-by-step deployment: see [deploy.md](deploy.md).

## Deploy on Vercel
1. Push to GitHub, import in Vercel (Next.js preset).
2. Storage → Create Blob (Public) and connect it to the project.
3. Add a Postgres DB from the Vercel Marketplace (Neon) — it injects `DATABASE_URL`.
4. Add `ADMIN_PIN` and `NEXT_PUBLIC_SITE_URL`.
5. Redeploy, then upload photos in `/relish` → Gallery.

## Admin
`/relish` edits site text, fixed prices, the custom pricing formula, the gallery and home carousel. Saves go to Postgres; `localStorage` is only a cache. PIN-gated, `noindex`, linked from the footer only.

## Custom domain / path
Add the domain in Vercel → Settings → Domains and set `NEXT_PUBLIC_SITE_URL`. For a `/relish` sub-path on another domain, point that domain's `/relish` route to this deployment or use a rewrite in the host project.

FSSAI Lic. No. 21320166000450 · Instagram https://www.instagram.com/relish_cakebox/
