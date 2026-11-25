import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap { const base=process.env.NEXT_PUBLIC_SITE_URL||"https://relish-cakebox.vercel.app"; const now=new Date(); return ["/","/designer","/gallery","/table-sets","/about"].map(p=>({url:`${base}${p}`,lastModified:now,changeFrequency:"weekly" as const,priority:p==="/"?1:0.8})); }
