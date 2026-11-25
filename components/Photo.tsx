import Image, { type ImageProps } from "next/image";

/**
 * Every photo on the site is already normalised to WebP and capped by
 * lib/image-server.ts, so Next's optimizer would only re-encode it.
 */
export default function Photo({ alt, ...props }: Omit<ImageProps, "unoptimized">) {
  return <Image {...props} alt={alt} unoptimized />;
}
