import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Photos are stored as WebP on Vercel Blob and rendered with `unoptimized`,
    // so this only matters if a plain <Image> is ever pointed at Blob.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
