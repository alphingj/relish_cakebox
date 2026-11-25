/**
 * Format helpers shared by the browser and the server, so both agree on what
 * counts as an image and what counts as an iPhone HEIC.
 */

export const IMAGE_EXTENSIONS = [
  "jpg", "jpeg", "png", "webp", "gif", "bmp", "tif", "tiff", "avif", "heic", "heif",
];

export function isImageFileName(name: string): boolean {
  const ext = name.toLowerCase().split(".").pop() || "";
  return IMAGE_EXTENSIONS.includes(ext);
}

/** iPhone HEIC/HEIF. Canvas cannot decode these outside Safari. */
export function isHeicFile(file: { name: string; type?: string }): boolean {
  const type = (file.type || "").toLowerCase();
  return type === "image/heic" || type === "image/heif" || /\.(heic|heif)$/i.test(file.name);
}

/** Some browsers report HEIC as an empty type or application/octet-stream. */
export function isImageFile(file: { name: string; type?: string }): boolean {
  return (file.type || "").toLowerCase().startsWith("image/") || isImageFileName(file.name);
}
