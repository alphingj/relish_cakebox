import { NextResponse } from "next/server";
import { del, put } from "@vercel/blob";
import { checkPin } from "@/lib/db";
import { photoKey, toWebp } from "@/lib/image-server";

function isBlobUrl(raw: string) {
  try { const u = new URL(raw); return u.protocol === "https:" && u.hostname.endsWith(".public.blob.vercel-storage.com"); } catch { return false; }
}

export async function POST(req: Request) {
  const { url, name } = (await req.json().catch(() => ({}))) as { url?: string; name?: string };
  if (!url || !isBlobUrl(url)) return NextResponse.json({ error: "Invalid Blob URL" }, { status: 400 });
  const pathname = new URL(url).pathname;
  const admin = await checkPin(req);
  if (pathname.startsWith("/cakes/") && !admin) return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  if (!pathname.startsWith("/cakes/") && !pathname.startsWith("/temp/")) return NextResponse.json({ error: "Invalid upload path" }, { status: 400 });

  const res = await fetch(url);
  if (!res.ok) return NextResponse.json({ error: "Could not read uploaded photo" }, { status: 502 });
  const len = Number(res.headers.get("content-length") || 0);
  if (len > 50 * 1024 * 1024) return NextResponse.json({ error: "Photo over 50 MB" }, { status: 413 });
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.byteLength > 50 * 1024 * 1024) return NextResponse.json({ error: "Photo over 50 MB" }, { status: 413 });

  let webp;
  try { webp = await toWebp(buf); } catch { return NextResponse.json({ error: "That file could not be read as an image. Use JPG, PNG, WebP or HEIC." }, { status: 415 }); }

  const prefix = pathname.startsWith("/temp/") ? "temp/" : "cakes/";
  const blob = await put(prefix + photoKey(name || "photo").replace(/^cakes\//, ""), webp.data, { access: "public", contentType: "image/webp", addRandomSuffix: true });
  await del(url).catch(() => {});
  return NextResponse.json({ url: blob.url, width: webp.width, height: webp.height, bytes: webp.data.byteLength, originalBytes: buf.byteLength });
}
