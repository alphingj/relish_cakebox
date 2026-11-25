"use client";
import { DEFAULT_SETTINGS, SETTINGS_KEY, mergeSettings, type SiteSettings } from "./settings"; export type { SiteSettings };
import { DEFAULT_FIXED, DEFAULT_PRICING, type FixedPrice, type PricingConfig } from "./pricing";
import { SEED_CAKES, type Cake } from "./cakes";
export const PRICING_KEY="relish_pricing_v1"; export const GALLERY_KEY="relish_gallery_v1";
function read<T>(key:string, fallback:T):T { if(typeof window==="undefined") return fallback; try{ const v=localStorage.getItem(key); return v? {...fallback, ...JSON.parse(v)}: fallback; }catch{ return fallback; } }
function readArr<T>(key:string, fallback:T[]):T[] { if(typeof window==="undefined") return fallback; try{ const v=localStorage.getItem(key); return v? JSON.parse(v): fallback; }catch{ return fallback; } }
export function loadPricing(): {config:PricingConfig; fixed:FixedPrice[]} { const raw=read<{config:PricingConfig;fixed:FixedPrice[]}>(PRICING_KEY,{config:DEFAULT_PRICING,fixed:DEFAULT_FIXED}); return {config:{...DEFAULT_PRICING,...raw.config}, fixed: raw.fixed?.length?raw.fixed:DEFAULT_FIXED}; }
export function savePricing(config:PricingConfig, fixed:FixedPrice[]){ localStorage.setItem(PRICING_KEY, JSON.stringify({config,fixed})); fetch("/api/pricing",{method:"PUT",headers:{"Content-Type":"application/json","x-admin-pin":sessionStorage.getItem("relish_pin")||""},body:JSON.stringify({config,fixed})}).catch(()=>{}); }
export function loadGalleryLocal(): Cake[] { return readArr(GALLERY_KEY, SEED_CAKES); }
export function saveGalleryLocal(cakes:Cake[]){ localStorage.setItem(GALLERY_KEY, JSON.stringify(cakes)); }
export async function loadGallery(): Promise<Cake[]> { try{ const r=await fetch("/api/gallery"); if(r.ok){ const d=await r.json(); if(Array.isArray(d.cakes)&&d.cakes.length) return d.cakes; } }catch{} return loadGalleryLocal(); }

export function loadSettingsLocal(): SiteSettings { if(typeof window==="undefined") return DEFAULT_SETTINGS; try{ const v=localStorage.getItem(SETTINGS_KEY); return mergeSettings(v?JSON.parse(v):null); }catch{ return DEFAULT_SETTINGS; } }
export function saveSettingsLocal(s:SiteSettings){ localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); fetch("/api/settings",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)}).catch(()=>{}); }
export async function loadSettings(): Promise<SiteSettings> { try{ const r=await fetch("/api/settings"); if(r.ok){ const d=await r.json(); if(d.settings) return mergeSettings(d.settings); } }catch{} return loadSettingsLocal(); }
