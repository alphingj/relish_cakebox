"use client";
import { isImageFile } from "./image-types";

/** Browser-side target; leaves room under the 4.5 MB request-body limit. */
export const UPLOAD_MAX_BYTES = 3_500_000;
/** Longest edge before upload; the server enforces the same value again. */
export const UPLOAD_MAX_EDGE = 1600;

const QUALITIES = [0.9, 0.82, 0.72, 0.62, 0.5, 0.4];
const DOWNSCALE_ROUNDS = 4;

type Decoded = { source: CanvasImageSource; width: number; height: number; cleanup: () => void };

async function decode(file: File): Promise<Decoded> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, cleanup: () => bitmap.close() };
    } catch {
      // fall through to <img> decoding
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("decode failed"));
      el.src = url;
    });
    return { source: img, width: img.naturalWidth, height: img.naturalHeight, cleanup: () => URL.revokeObjectURL(url) };
  } catch (e) {
    URL.revokeObjectURL(url);
    throw e;
  }
}

function fileFromBlob(blob: Blob, originalName: string): File {
  const ext = blob.type === "image/webp" ? "webp" : (blob.type.split("/")[1] || "webp").replace("jpeg", "jpg");
  const base = originalName.replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${base}.${ext}`, { type: blob.type || "image/webp", lastModified: Date.now() });
}

/**
 * Re-encodes any image the browser can decode to WebP, capped at UPLOAD_MAX_EDGE
 * and UPLOAD_MAX_BYTES. iPhone HEIC (and any other format canvas cannot read) is
 * sent untouched so the server can decode it with libheif.
 */
export async function prepareImageForUpload(file: File): Promise<File> {
  if (!isImageFile(file)) throw new Error("That file is not an image.");

  let decoded: Decoded;
  try {
    decoded = await decode(file);
  } catch {
    // Browser cannot decode it (usually HEIC in Chromium). Send untouched:
    // uploadPhoto routes oversized files through direct Blob upload, then the
    // server decodes and converts to WebP.
    return file;
  }

  const { source, width, height, cleanup } = decoded;
  try {
    const scale = Math.min(1, UPLOAD_MAX_EDGE / Math.max(width, height));
    let w = Math.max(1, Math.round(width * scale));
    let h = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("This browser cannot process photos.");

    for (let round = 0; round < DOWNSCALE_ROUNDS; round++) {
      canvas.width = w;
      canvas.height = h;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(source, 0, 0, w, h);

      for (const quality of QUALITIES) {
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
        if (blob && blob.size <= UPLOAD_MAX_BYTES) return fileFromBlob(blob, file.name);
      }

      w = Math.max(1, Math.round(w * 0.82));
      h = Math.max(1, Math.round(h * 0.82));
    }

    throw new Error("Could not get this photo under 3.5 MB. Try a smaller image.");
  } finally {
    cleanup();
  }
}
