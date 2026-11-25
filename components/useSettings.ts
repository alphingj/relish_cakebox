"use client"; import { useEffect, useState } from "react"; import { DEFAULT_SETTINGS, type SiteSettings } from "@/lib/settings"; import { loadSettings } from "@/lib/storage";
export function useSettings(){ const [s,setS]=useState<SiteSettings>(DEFAULT_SETTINGS); useEffect(()=>{ loadSettings().then(setS); },[]); return s; }
