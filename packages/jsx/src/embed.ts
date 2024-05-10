/* eslint-disable @typescript-eslint/naming-convention */
import { EmbedType } from "lilybird";

import type { Embed } from "lilybird";

function parseHexToByte10(hex: string): number {
    return Number(hex.replace("#", "0x"));
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
    color?: number,
    children?: Array<EmbedComponent> | EmbedComponent
}): Embed.Structure {
    if (typeof timestamp === "number") timestamp = new Date(timestamp);
    if (typeof timestamp === "boolean") timestamp = new Date();

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
