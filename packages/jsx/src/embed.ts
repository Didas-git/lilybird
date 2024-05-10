/* eslint-disable @typescript-eslint/naming-convention */
import { EmbedType } from "lilybird";

import type { Embed } from "lilybird";

export enum Color {
    Red = 0xFF0000,
    Green = 0x00FF00,
    Blue = 0x0000FF,
    Yellow = 0xFFFF00,
    Purple = 0x800080,
    Violet = 0xEE82EE,
    Indigo = 0x4B0082,
    SpringGreen = 0x00FF7F,
    FernGreen = 0x4F7942,
    Crimson = 0xDC143C,
    Golden = 0xFFD700,
    Pink = 0xFFC0CB,
    LimeGreen = 0x32CD32,
    WaterBlue = 0x3399FF,
    WaterGreen = 0x3EB489,
    SkyBlue = 0x87CEEB,
    Mint = 0x98FF98,
    Orange = 0xFFA500,
    BananaYellow = 0xFFFACD,
    Peach = 0xFFDAB9,
    KiwiGreen = 0x8EE53F,
    BerryPurple = 0x990099,
    LemonYellow = 0xFFF44F,
    GrapePurple = 0x6F2DA8
}

function parseHexToByte10(hex: string): number {
    if (!hex.startsWith("#")) hex = `#${hex}`;
    return Number(hex.replace("#", "0x"));
}

function rgbToByte10(rgb: Array<number>): number {
    if (rgb.length === 3) return Number(`0x${((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1)}`);
    else if (rgb.length === 4) return Number(`0x${((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1)}`); // Because hex doesn't have opacity.
    throw new RangeError(`Invalid RGB/RGBA length. Expected: 3 or 4. Got: ${rgb.length}`);
}

function parseEmbedChildren(children: Array<EmbedComponent> | EmbedComponent | undefined): Omit<Embed.Structure, "title" | "type" | "description" | "url" | "timestamp" | "color"> | undefined {
    if (children == null) return;
    if (!Array.isArray(children)) return { [children.type]: children.data };

    let obj: ReturnType<typeof parseEmbedChildren> & { fields: Array<Embed.FieldStructure> } = { fields: [] };

    for (let i = 0, { length } = children; i < length; i++) {
        const child = children[i];

        if (Array.isArray(child)) {
            obj = { ...obj, ...parseEmbedChildren(child) };
            continue;
        }

        if (child.type === "field") {
            obj.fields.push(child.data);
            continue;
        }

        obj[child.type] = <never>child.data;
    }

    return obj;
}

export function Embed({
    title,
    description,
    url,
    timestamp,
    color,
    children
}: {
    title?: string,
    description?: string,
    url?: string,
    timestamp?: boolean | Date | number,
    color?: Color | string | number | Array<number>,
    children?: Array<EmbedComponent> | EmbedComponent
}): Embed.Structure {
    if (typeof timestamp === "number") timestamp = new Date(timestamp);
    if (typeof timestamp === "boolean") timestamp = new Date();

    if (typeof color === "string") color = parseHexToByte10(color);
    else if (Array.isArray(color)) color = rgbToByte10(color);

    return {
        title,
        type: EmbedType.Rich,
        description,
        url,
        timestamp: timestamp?.toISOString(),
        color,
        ...parseEmbedChildren(children)
    };
}

interface FooterComponent {
    type: "footer";
    data: Embed.FooterStructure;
}

interface ImageComponent {
    type: "image";
    data: Embed.ImageStructure;
}

interface ThumbnailComponent {
    type: "thumbnail";
    data: Embed.ThumbnailStructure;
}

interface VideoComponent {
    type: "video";
    data: Embed.VideoStructure;
}

interface ProviderComponent {
    type: "provider";
    data: Embed.ProviderStructure;
}

interface AuthorComponent {
    type: "author";
    data: Embed.AuthorStructure;
}

interface FieldComponent {
    type: "field";
    data: Embed.FieldStructure;
}

type EmbedComponent = FooterComponent | ImageComponent | ThumbnailComponent | VideoComponent | ProviderComponent | AuthorComponent | FieldComponent;

function embedComponent<T extends EmbedComponent>(type: EmbedComponent["type"], data: EmbedComponent["data"]): T {
    return <never>{ type, data };
}

export function EmbedFooter(props: Embed.FooterStructure): FooterComponent {
    return embedComponent("footer", props);
}

export function EmbedImage(props: Embed.ImageStructure): ImageComponent {
    return embedComponent("image", props);
}

export function EmbedThumbnail(props: Embed.ThumbnailStructure): ThumbnailComponent {
    return embedComponent("thumbnail", props);
}

export function EmbedVideo(props: Embed.VideoStructure): VideoComponent {
    return embedComponent("video", props);
}

export function EmbedProvider(props: Embed.ProviderStructure): ProviderComponent {
    return embedComponent("provider", props);
}

export function EmbedAuthor(props: Embed.AuthorStructure): AuthorComponent {
    return embedComponent("author", props);
}

export function EmbedField(props: Embed.FieldStructure): FieldComponent {
    return embedComponent("field", props);
}
