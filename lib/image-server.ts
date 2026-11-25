import sharp from "sharp";

/** Largest file the browser should send (Vercel caps the request body at 4.5 MB). */
export const MAX_UPLOAD_BYTES = 4_500_000;
/** Every stored photo is re-encoded to stay at or below this. */
export const MAX_STORED_BYTES = 1_500_000;
/** Longest edge of a stored photo, in pixels. */
export const MAX_STORED_EDGE = 1600;

const QUALITIES = [82, 70, 58, 46];
const EDGES = [MAX_STORED_EDGE, 1200, 900];
const HEIC_BRANDS = ["heic", "heix", "hevc", "hevx", "heim", "heis", "hevm", "hevs", "mif1", "msf1"];

type Raw = { data: Buffer; width: number; height: number; channels: number };

export type WebpResult = { data: Buffer; width: number; height: number };

/**
 * iPhone photos are HEIC. sharp's prebuilt libvips can only read AVIF, so any
 * HEIF container that sharp rejects is decoded with libheif (heic-decode).
 */
function isHeicContainer(input: Buffer): boolean {
  if (input.length < 12 || input.toString("latin1", 4, 8) !== "ftyp") return false;
  const brand = input.toString("latin1", 8, 12).replace(/\0/g, "").trim();
  return HEIC_BRANDS.includes(brand);
}

async function decodeHeic(input: Buffer): Promise<Raw> {
  // Dynamic import keeps the ~9 MB wasm bundle out of the route's startup path.
  const { default: decode } = await import("heic-decode");
  const { data, width, height } = await decode({ buffer: input });
  const channels = Math.round(data.byteLength / (width * height));
  if (width <= 0 || height <= 0 || (channels !== 3 && channels !== 4)) {
    throw new Error("Unsupported HEIC pixel layout");
  }
  // libheif already applied the irot/imir orientation during display.
  return { data: Buffer.from(data.buffer, data.byteOffset, data.byteLength), width, height, channels };
}

async function fit(raw: Raw, edge: number): Promise<Raw> {
  if (Math.max(raw.width, raw.height) <= edge) return raw;
  const { data, info } = await sharp(raw.data, { raw: { width: raw.width, height: raw.height, channels: raw.channels as 1 | 2 | 3 | 4 } })
    .resize({ width: edge, height: edge, fit: "inside", withoutEnlargement: true })
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height, channels: info.channels };
}

/** Auto-orients and fits inside MAX_STORED_EDGE, decoding HEIC when sharp cannot. */
async function loadRaw(input: Buffer): Promise<Raw> {
  try {
    const { data, info } = await sharp(input)
      .rotate()
      .resize({ width: MAX_STORED_EDGE, height: MAX_STORED_EDGE, fit: "inside", withoutEnlargement: true })
      .raw()
      .toBuffer({ resolveWithObject: true });
    return { data, width: info.width, height: info.height, channels: info.channels };
  } catch (error) {
    if (!isHeicContainer(input)) throw error;
    return fit(await decodeHeic(input), MAX_STORED_EDGE);
  }
}

/**
 * Decodes JPG/PNG/WebP/AVIF/HEIC, then keeps lowering quality and dimensions
 * until the WebP is at or below MAX_STORED_BYTES.
 */
export async function toWebp(input: Buffer): Promise<WebpResult> {
  const base = await loadRaw(input);

  let smallest: WebpResult | null = null;

  for (const edge of EDGES) {
    const raw = await fit(base, edge);

    for (const quality of QUALITIES) {
      const out = await sharp(raw.data, { raw: { width: raw.width, height: raw.height, channels: raw.channels as 1 | 2 | 3 | 4 } })
        .webp({ quality, effort: 4 })
        .toBuffer();
      const candidate: WebpResult = { data: out, width: raw.width, height: raw.height };
      if (!smallest || out.byteLength < smallest.data.byteLength) smallest = candidate;
      if (out.byteLength <= MAX_STORED_BYTES) return candidate;
    }
  }

  return smallest!;
}

export function photoKey(originalName: string): string {
  const slug = originalName
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "photo";
  return `cakes/${Date.now()}-${slug}.webp`;
}
