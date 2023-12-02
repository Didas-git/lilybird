/* eslint-disable @typescript-eslint/naming-convention */
import { EmbedType } from "../enums";

import type {
    EmbedThumbnailStructure,
    EmbedProviderStructure,
    EmbedAuthorStructure,
    EmbedFooterStructure,
    EmbedFieldStructure,
    EmbedImageStructure,
    EmbedVideoStructure,
    EmbedStructure
} from "../typings";

function parseEmbedChildren(children: Array<EmbedComponent> | EmbedComponent | undefined):
    Omit<EmbedStructure, "title"
        | "type"
        | "description"
        | "url"
        | "timestamp"
        | "color"
    > | undefined {
    if (children == null) return;
    if (!(children instanceof Array)) return { [children.type]: children.data };

    let obj: ReturnType<typeof parseEmbedChildren> & { fields: Array<EmbedFieldStructure> } = { fields: [] };

    for (let i = 0, length = children.length; i < length; i++) {
        const child = children[i];

        if (child instanceof Array) {
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
}): EmbedStructure {
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
    data: EmbedFooterStructure;
}

interface ImageComponent {
    type: "image";
    data: EmbedImageStructure;
}

interface ThumbnailComponent {
    type: "thumbnail";
    data: EmbedThumbnailStructure;
}

interface VideoComponent {
    type: "video";
    data: EmbedVideoStructure;
}

interface ProviderComponent {
    type: "provider";
    data: EmbedProviderStructure;
}

interface AuthorComponent {
    type: "author";
    data: EmbedAuthorStructure;
}

interface FieldComponent {
    type: "field";
    data: EmbedFieldStructure;
}

type EmbedComponent = FooterComponent | ImageComponent | ThumbnailComponent | VideoComponent | ProviderComponent | AuthorComponent | FieldComponent;

function embedComponent<T extends EmbedComponent>(type: EmbedComponent["type"], data: EmbedComponent["data"]): T {
    return <never>{ type, data };
}

export function EmbedFooter(props: EmbedFooterStructure): FooterComponent {
    return embedComponent("footer", props);
}

export function EmbedImage(props: EmbedImageStructure): ImageComponent {
    return embedComponent("image", props);
}

export function EmbedThumbnail(props: EmbedThumbnailStructure): ThumbnailComponent {
    return embedComponent("thumbnail", props);
}

export function EmbedVideo(props: EmbedVideoStructure): VideoComponent {
    return embedComponent("video", props);
}

export function EmbedProvider(props: EmbedProviderStructure): ProviderComponent {
    return embedComponent("provider", props);
}

export function EmbedAuthor(props: EmbedAuthorStructure): AuthorComponent {
    return embedComponent("author", props);
}

export function EmbedField(props: EmbedFieldStructure): FieldComponent {
    return embedComponent("field", props);
}