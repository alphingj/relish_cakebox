import type { MetadataRoute } from "next"; import { SITE_URL } from "@/lib/site";
export default function robots(): MetadataRoute.Robots { const base=SITE_URL; return { rules:[{userAgent:"*",allow:"/",disallow:["/relish","/api/"]},{userAgent:"OAI-SearchBot",allow:"/"},{userAgent:"PerplexityBot",allow:"/"}], sitemap:`${base}/sitemap.xml` }; }
