# Deploy Relish Cakebox on Vercel

Production checklist. Do steps in order. Site has **no demo data and no placeholder images**: gallery/homepage stay empty until owner uploads real cake photos in admin.

## 1. Push code to GitHub

```bash
git add -A
git commit -m "Production ready"
git push -u origin main
```

If push rejected because remote moved:

```bash
git pull --rebase origin main
git push -u origin main
```

Auth options: `gh auth login`, HTTPS personal access token, or SSH remote.

## 2. Import project in Vercel

1. Vercel Dashboard → Add New → Project → import `alphingj/relish_cakebox`.
2. Framework preset: **Next.js**. Root directory: `./`. Build command: `npm run build`. Install command: default.
3. Do **not** deploy as production until env + storage below are set. Preview deploy is fine.

## 3. Create Vercel Blob store (cake photos)

1. Vercel Dashboard → Storage → Create Database/Store → **Blob**.
2. Access: **Public**. Reason: gallery photos must load for visitors without login.
3. Connect store to this project for Production + Preview (+ Development if available).
4. Vercel injects Blob credentials automatically (OIDC: `BLOB_STORE_ID` + rotating token; older stores use `BLOB_READ_WRITE_TOKEN`).
5. Never paste Blob tokens into code or GitHub. Local dev only: copy read-write token into `.env.local` (gitignored).

Photo flow after deploy: Admin upload → browser resize/WebP → Blob public URL → URL saved in Postgres → site renders URL. Old Blob photo is deleted on Save only when no cake/settings field still references it.

## 4. Create Postgres DB (shared content/prices)

1. Vercel Dashboard → Storage / Marketplace → **Neon Postgres** → create database.
2. Connect to project (Production + Preview). Neon injects `DATABASE_URL` (and unpooled variants).
3. No manual migration needed. App creates tables on first API call:
   - `gallery_cakes`
   - `pricing_store`
   - `site_settings`
4. Verify later: admin change → open site in private window / second phone → change must appear. That proves DB, not browser cache.

## 5. Environment variables

Vercel → Project → Settings → Environment Variables. Set for **Production** (and Preview if testing there):

| Name | Value | Required |
|---|---|---|
| `ADMIN_PIN` | Owner-chosen admin password. Long, private. | Yes |
| `DATABASE_URL` | Injected by Neon when connected. Do not type manually unless Neon dashboard gives it. | Yes |
| `NEXT_PUBLIC_SITE_URL` | Final public URL, e.g. `https://www.yourdomain.com` or Vercel URL. No trailing slash preferred. | Yes |
| `BLOB_READ_WRITE_TOKEN` | Only if Vercel shows Blob using legacy token mode / local dev. OIDC stores inject automatically. | Conditional |

Rules:
- `ADMIN_PIN` is only place admin password lives. No password in code. If missing in production, admin login returns 503 and protected saves are denied.
- After changing any env var: **redeploy** (Deployments → latest → Redeploy). Env changes do not apply to old deployment.
- Local dev: copy `.env.example` to `.env.local`, fill same values, run `npm run dev`.

## 6. Redeploy + first login

1. Deployments → Redeploy latest commit with new env.
2. Open `https://YOUR-DOMAIN/relish`.
3. Login with `ADMIN_PIN` value.
4. If login says ADMIN_PIN not set: env var is in wrong project/environment or deployment predates it. Fix env → redeploy.

## 7. Add real content (no placeholders)

Admin tabs:

1. **Site Content**: business name, phone display, address, FSSAI, Instagram/Facebook/Maps, footer, homepage hero/carousel, gallery/designer/table-set/about text, FAQ, occasions, colours, size chart.
2. **Gallery**: Add cake → name, occasion, starting price, sizes, description → Upload photo → Save. Cake without photo stays unpublished. JPG/PNG/WebP/AVIF/HEIC supported; stored as WebP ≤1600px and ≤1.5MB. Large HEIC >4.5MB uploads direct to Blob, then server converts to WebP.
3. **Fixed Prices**: standard cake + kg prices.
4. **Custom Pricing**: base/kg, flavour/shape/theme extras, delivery, variance, table-set base. Add new flavours/shapes/themes here; Designer picks them up.
5. Press **Save all changes**. Status must say live for every visitor. If it says browser only: `DATABASE_URL` missing/not connected.

Homepage rule: only admin-uploaded photos show. No upload = no cake photo sections. This is intentional.

## 8. Custom domain (optional but recommended)

1. Vercel → Project → Settings → Domains → add domain/subdomain.
2. Add DNS records Vercel shows (usually CNAME/A). Wait for Valid Configuration + SSL.
3. Set `NEXT_PUBLIC_SITE_URL=https://your-domain` (Production).
4. Redeploy. This fixes canonical URLs, sitemap, robots, Open Graph, JSON-LD.
5. Check: `/robots.txt`, `/sitemap.xml`, page source canonical all use same domain.

## 9. Google / SEO setup after domain live

1. Google Business Profile: one profile only, real premises. Name exactly `Relish Cakebox`; category Bakery/Cake shop; phone `+91 92078 43867`; website = final domain; order link = WhatsApp link; service areas Pala/Kottayam/Marangattupilly etc. Address spelling must match site exactly: **Marangattupilly, Pala, Kottayam – 686635, Kerala**. If GBP uses different spelling, edit site in Admin → Site Content to match GBP before sharing links.
2. Google Search Console: verify domain, submit `/sitemap.xml`.
3. Bing Webmaster + Bing Places (import from Google profile), JustDial, Apple Business Connect: same name/address/phone/hours everywhere.
4. Instagram bio link = final domain.
5. Test searches/AI later (weeks): “custom cake Pala”, “cake delivery Marangattupilly”, “1kg chocolate truffle cake price Pala”.

## 10. Production verification checklist

Run before announcing launch:

```bash
npm run build
npm run lint
npx tsc --noEmit
```

Live checks:
- `/`, `/designer`, `/gallery`, `/table-sets`, `/about` load on phone (360px) + desktop. No sideways scroll.
- `/relish` login wrong password fails; correct `ADMIN_PIN` works; logout works.
- Upload one real cake in Gallery → Save → reload → private window/second phone sees it.
- Replace that photo → Save → old photo URL no longer used; new photo shows.
- Change one price in admin → Designer + Gallery reflect it on second device.
- Designer: occasion → kg/shape → flavour → theme → date/delivery → WhatsApp opens `wa.me/919207843867` with full summary.
- Gallery card + modal WhatsApp buttons include cake name.
- Footer/About show FSSAI Lic. No. `21320166000450`, phone `+91 92078 43867`, Instagram.
- `/robots.txt` disallows `/relish` + `/api/`; `/sitemap.xml` uses final domain; `/relish` has noindex.
- No placeholder/demo cake photos anywhere. Empty gallery before owner uploads is correct.

## 11. Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Admin login 503 | `ADMIN_PIN` missing for that environment. Set → redeploy. |
| Login 401 | Wrong password or old deployment. Confirm env value exactly; redeploy. |
| Login 429 | 5 attempts in 10 min from same IP. Wait 10 min. |
| Save says browser only | `DATABASE_URL` missing. Connect Neon → redeploy. |
| Upload 503 / Blob not configured | Blob store not connected. Connect Public Blob → redeploy. Local: set `BLOB_READ_WRITE_TOKEN` in `.env.local`. |
| Upload HEIC fails on huge file | Use latest deploy; >4.5MB goes direct-to-Blob then WebP conversion. Check Blob connected + function logs. |
| Photo uploaded but homepage empty | Press Save all changes; cake Visible on; photo must be uploaded (URL), not blank. |
| Price change only on one phone | DB not shared / browser-only save. Fix `DATABASE_URL`. |
| Canonical/sitemap shows localhost or wrong domain | `NEXT_PUBLIC_SITE_URL` wrong. Set final domain → redeploy. |
| Old photo still public after replace | Save did not complete or another field still uses URL. Re-save; deletion only removes unreferenced Blob URLs. |

## 12. Daily owner use

- Add cakes: `/relish` → Gallery → Add cake → upload real photo → Save.
- Change prices: Fixed Prices / Custom Pricing → Save.
- Change any text/photo/contact: Site Content → Save.
- After every change, test on phone in private window once. That is source of truth.
