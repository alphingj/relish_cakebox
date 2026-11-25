"use client";
import { DEFAULT_SETTINGS, SETTINGS_KEY, mergeSettings, type SiteSettings } from "./settings"; export type { SiteSettings };
import { DEFAULT_FIXED, DEFAULT_PRICING, type FixedPrice, type PricingConfig } from "./pricing";
import type { Cake } from "./cakes";

export const PRICING_KEY = "relish_pricing_v1";
// v2: drops the old seed-cake cache so browsers that stored placeholders start empty.
export const GALLERY_KEY = "relish_gallery_v2";

export type SaveResult = { ok: boolean; error?: string };

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const v = localStorage.getItem(key); return v ? { ...fallback, ...JSON.parse(v) } : fallback; } catch { return fallback; }
}

function readArr<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return fallback;
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}

async function putJson(url: string, body: unknown): Promise<SaveResult> {
  try {
    const res = await fetch(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok && data.ok !== false, error: typeof data.error === "string" ? data.error : undefined };
  } catch {
    return { ok: false, error: "Network error" };
  }
}

export function loadPricing(): { config: PricingConfig; fixed: FixedPrice[] } {
  const raw = read<{ config: PricingConfig; fixed: FixedPrice[] }>(PRICING_KEY, { config: DEFAULT_PRICING, fixed: DEFAULT_FIXED });
  return { config: { ...DEFAULT_PRICING, ...raw.config }, fixed: Array.isArray(raw.fixed) ? raw.fixed : DEFAULT_FIXED };
}

export async function loadPricingAsync(): Promise<{ config: PricingConfig; fixed: FixedPrice[] }> {
  try {
    const res = await fetch("/api/pricing");
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === "object" && "config" in data) {
        return {
          config: { ...DEFAULT_PRICING, ...data.config },
          fixed: Array.isArray(data.fixed) ? data.fixed : DEFAULT_FIXED,
        };
      }
    }
  } catch {}
  return loadPricing();
}

export function savePricing(config: PricingConfig, fixed: FixedPrice[]): Promise<SaveResult> {
  localStorage.setItem(PRICING_KEY, JSON.stringify({ config, fixed }));
  return putJson("/api/pricing", { config, fixed });
}

export function loadGalleryLocal(): Cake[] { return readArr<Cake>(GALLERY_KEY, []); }

export function saveGalleryLocal(cakes: Cake[]) { localStorage.setItem(GALLERY_KEY, JSON.stringify(cakes)); }

export function saveGallery(cakes: Cake[]): Promise<SaveResult> {
  saveGalleryLocal(cakes);
  return putJson("/api/gallery", { cakes });
}

export async function loadGallery(opts: { all?: boolean } = {}): Promise<Cake[]> {
  try {
    const res = await fetch(opts.all ? "/api/gallery?all=1" : "/api/gallery");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.cakes)) return data.cakes;
    }
  } catch {}
  // The admin view never falls back to a cached list: saving a stale cache
  // would overwrite the shared gallery.
  return opts.all ? [] : loadGalleryLocal();
}

export function loadSettingsLocal(): SiteSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try { const v = localStorage.getItem(SETTINGS_KEY); return mergeSettings(v ? JSON.parse(v) : null); } catch { return DEFAULT_SETTINGS; }
}

export function saveSettingsLocal(s: SiteSettings): Promise<SaveResult> {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  return putJson("/api/settings", s);
}

export async function loadSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch("/api/settings");
    if (res.ok) {
      const data = await res.json();
      if (data.settings) return mergeSettings(data.settings);
    }
  } catch {}
  return loadSettingsLocal();
}
