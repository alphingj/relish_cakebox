# Relish Cakebox Website

Mobile-first Next.js site for Relish Cakebox, Marangattupilly / Pala. Every order ends on WhatsApp: +91 92078 43867.

## Run locally
```bash
npm install
npm run dev   # http://localhost:3000
```
Admin: open `/relish` and login with the password set in the `ADMIN_PIN` environment variable (Vercel > Settings > Environment Variables). No default password in production.

## Owner: change prices
Go to `/relish` → Site Content / Fixed Prices / Custom Pricing / Gallery → edit → Save. Everything (header, footer, contact, homepage text, carousel, all page text) is editable there. With `DATABASE_URL` set, changes are shared for all visitors. Without it, changes save in that browser only (demo mode). Homepage shows only photos uploaded in Admin.

## Deploy on Vercel
1. Push to GitHub, import in Vercel (Next.js preset).
2. Storage > Create Blob (Public) and connect to the project.
3. Add a Postgres DB from Vercel Marketplace (Neon) — it injects `DATABASE_URL`.
4. Env vars: `ADMIN_PIN` (admin password, required), `NEXT_PUBLIC_SITE_URL` (your domain). Blob OIDC vars are added automatically.
5. Redeploy. Upload gallery photos in `/relish` → Gallery.

## Replace cake photos
Upload in Admin → Gallery (Vercel Blob), or replace files in `public/cakes/` and update the photo URL in Admin. See `public/cakes/README.md`.

## Custom domain / path
Add the domain in Vercel → Settings → Domains and set `NEXT_PUBLIC_SITE_URL`. For a `/relish` sub-path on another domain, point that domain's `/relish` route to this deployment or use a rewrite in the host project.

FSSAI Lic. No. 21320166000450 · Instagram https://www.instagram.com/relish_cakebox/
# relish_cakebox
