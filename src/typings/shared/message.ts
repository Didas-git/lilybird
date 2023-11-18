import type { AttachmentFlags, EmbedType } from "../../enums";

export interface AttachmentStructure {
    id: string;
    filename: string;
    description?: string;
    content_type?: string;
    size: number;
    url: string;
    proxy_url: string;
    height?: number | null;
    width?: number | null;
    ephemeral?: boolean;
    duration_secs?: number;
    waveform?: string;
    flags?: AttachmentFlags;
}

export interface EmbedStructure {
    title?: string;
    type?: EmbedType;
    description?: string;
    url?: string;
    /** ISO8601 Timestamp */
    timestamp?: string;
    color?: number;
    footer?: EmbedFooterStructure;
    image?: EmbedImageStructure;
    thumbnail?: EmbedThumbnailStructure;
    video?: EmbedVideoStructure;
    provider?: EmbedProviderStructure;
    author?: EmbedAuthorStructure;
    fields?: Array<EmbedFieldStructure>;
}

export interface EmbedFooterStructure {
    text: string;
    icon_url?: string;
    proxy_icon_url?: string;
}

export interface EmbedImageStructure {
    url: string;
    proxy_url?: string;
    height?: number;
    width?: number;
}

export interface EmbedThumbnailStructure {
    url: string;
    proxy_url?: string;
    height?: number;
    width?: number;
}

export interface EmbedVideoStructure {
    url: string;
    proxy_url?: string;
    height?: number;
    width?: number;
}

export interface EmbedProviderStructure {
    name?: string;
    url?: string;
}

export interface EmbedAuthorStructure {
    name: string;
    url?: string;
    icon_url?: string;
    proxy_icon_url?: string;
}

export interface EmbedFieldStructure {
    name: string;
    value: string;
    inline?: boolean;
}