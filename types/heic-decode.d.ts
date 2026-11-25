declare module "heic-decode" {
  export type HeicImage = {
    width: number;
    height: number;
    data: Uint8ClampedArray;
  };
  export default function decode(options: { buffer: Uint8Array }): Promise<HeicImage>;
}
