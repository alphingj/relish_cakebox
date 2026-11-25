"use client";
import { prepareImageForUpload } from "./image-client";

async function directUpload(file: File): Promise<string> {
  const { upload } = await import("@vercel/blob/client");
  const prefix = "temp/";
  const blob = await upload(prefix + file.name, file, { access: "public", handleUploadUrl: "/api/upload/token", multipart: true });
  const res = await fetch("/api/upload/process", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: blob.url, name: file.name }) });
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !data.url) throw new Error(data.error || `Processing failed (${res.status})`);
  return data.url;
}

/** Compresses in the browser, then asks the server to normalise to WebP and store it. */
export async function uploadPhoto(file: File): Promise<string> {
  const prepared = await prepareImageForUpload(file);
  if (prepared.size > 4_400_000) return directUpload(prepared);
  const form = new FormData();
  form.append("file", prepared);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (res.status === 401) return directUpload(prepared);
  if (!res.ok || !data.url) throw new Error(data.error || `Upload failed (${res.status})`);
  return data.url;
}
