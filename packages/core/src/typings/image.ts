import type { ImageFormat } from "#enums";

export type ImageSize = 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096;

export interface CDNOptions {
    size?: ImageSize;
    format?: ImageFormat;
}
