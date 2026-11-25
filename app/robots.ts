import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots { const base=process.env.NEXT_PUBLIC_SITE_URL||"https://relish-cakebox.vercel.app"; return { rules:[{userAgent:"*",allow:"/",disallow:["/relish","/api/"]},{userAgent:"OAI-SearchBot",allow:"/"},{userAgent:"PerplexityBot",allow:"/"}], sitemap:`${base}/sitemap.xml` }; }
