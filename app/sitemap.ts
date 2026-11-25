import type { MetadataRoute } from "next"; import { SITE_URL } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap { const base=SITE_URL; const now=new Date(); return ["/","/designer","/gallery","/table-sets","/about"].map(p=>({url:`${base}${p}`,lastModified:now,changeFrequency:"weekly" as const,priority:p==="/"?1:0.8})); }
