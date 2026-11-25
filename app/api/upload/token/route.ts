import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { checkPin } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const body = (await req.json()) as HandleUploadBody;
  const admin = await checkPin(req);
  const ip = req.headers.get("x-forwarded-for") || "local";
  if (!admin && !rateLimit(`direct:${ip}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many uploads. Try again later." }, { status: 429 });
  }
  try {
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        const ok = pathname.startsWith("temp/") || (admin && pathname.startsWith("cakes/"));
        if (!ok) throw new Error("Invalid upload path");
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/avif", "image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence", "application/octet-stream"],
          maximumSizeInBytes: 50 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upload token failed" }, { status: 400 });
  }
}
