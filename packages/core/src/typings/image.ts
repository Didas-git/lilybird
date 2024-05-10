import type { ImageDataType, ImageFormat } from "#enums";

// Temporary
export type ImageData = `data:${ImageDataType};base64,${string}`;

export type ImageSize = 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096;

export interface CDNOptions {
    size?: ImageSize;
    format?: ImageFormat;
}
