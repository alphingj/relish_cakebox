import { NextResponse } from "next/server";
import { del, put } from "@vercel/blob";
import { checkPin } from "@/lib/db";
import { MAX_UPLOAD_BYTES, photoKey, toWebp } from "@/lib/image-server";
import { isImageFile } from "@/lib/image-types";

export async function POST(req: Request) {
  if (!(await checkPin(req))) return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Upload failed - the request was too large." }, { status: 413 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  // Browsers report iPhone HEIC as image/heic, or sometimes with no type at all.
  if (!isImageFile(file)) return NextResponse.json({ error: "Only image files can be uploaded." }, { status: 415 });
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `Photo is ${(file.size / 1_000_000).toFixed(1)} MB. Maximum is 4.5 MB - use a smaller photo.` },
      { status: 413 },
    );
  }

  let webp;
  try {
    webp = await toWebp(Buffer.from(await file.arrayBuffer()));
  } catch {
    return NextResponse.json(
      { error: "That file could not be read as an image. Use JPG, PNG, WebP or HEIC." },
      { status: 415 },
    );
  }

  try {
    const blob = await put(photoKey(file.name), webp.data, {
      access: "public",
      contentType: "image/webp",
      addRandomSuffix: true,
    });
    return NextResponse.json({
      url: blob.url,
      width: webp.width,
      height: webp.height,
      bytes: webp.data.byteLength,
      originalBytes: file.size,
    });
  } catch (e) {
    const detail = e instanceof Error ? e.message : "";
    return NextResponse.json(
      {
        error: detail
          ? `Upload failed: ${detail}`
          : "Blob storage is not configured. Connect a public Vercel Blob store, or paste an image URL instead.",
      },
      { status: 503 },
    );
  }
}

export async function DELETE(req: Request) {
  if (!(await checkPin(req))) return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { urls?: string[] };
  const urls = Array.isArray(body.urls) ? body.urls.filter((u): u is string => typeof u === "string") : [];
  const valid = urls.filter((u) => { try { const x = new URL(u); return x.protocol === "https:" && x.hostname.endsWith(".public.blob.vercel-storage.com"); } catch { return false; } });
  if (!valid.length) return NextResponse.json({ ok: true, deleted: [] });
  const q = (await import("@/lib/db")).sql();
  if (!q) return NextResponse.json({ error: "DATABASE_URL required for safe Blob deletion" }, { status: 503 });
  await (await import("@/lib/db")).ensureTables();
  const gallery = (await q`SELECT image FROM gallery_cakes`) as unknown as { image: string }[];
  const settingsRows = (await q`SELECT data FROM site_settings WHERE id=1`) as unknown as { data: unknown }[];
  const settingsText = settingsRows?.length ? JSON.stringify(settingsRows[0].data) : "";
  const used = new Set((gallery ?? []).map((r) => r.image));
  const orphans = valid.filter((u) => !used.has(u) && !settingsText.includes(u));
  if (orphans.length) await del(orphans);
  return NextResponse.json({ ok: true, deleted: orphans, skipped: valid.filter((u) => !orphans.includes(u)) });
}
