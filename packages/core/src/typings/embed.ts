import type { EmbedType } from "#enums";

export declare namespace Embed {
    /**
     * @see {@link https://discord.com/developers/docs/resources/channel#embed-object-embed-structure}
     */
    export interface Structure {
        title?: string;
        type?: EmbedType;
        description?: string;
        url?: string;
        /** ISO8601 Timestamp */
        timestamp?: string;
        color?: number;
        footer?: FooterStructure;
        image?: ImageStructure;
        thumbnail?: ThumbnailStructure;
        video?: VideoStructure;
        provider?: ProviderStructure;
        author?: AuthorStructure;
        fields?: Array<FieldStructure>;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/channel#embed-object-embed-thumbnail-structure}
     */
    export interface ThumbnailStructure {
        url: string;
        proxy_url?: string;
        height?: number;
        width?: number;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/channel#embed-object-embed-video-structure}
     */
    export interface VideoStructure {
        url: string;
        proxy_url?: string;
        height?: number;
        width?: number;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/channel#embed-object-embed-image-structure}
     */
    export interface ImageStructure {
        url: string;
        proxy_url?: string;
        height?: number;
        width?: number;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/channel#embed-object-embed-provider-structure}
     */
    export interface ProviderStructure {
        name?: string;
        url?: string;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/channel#embed-object-embed-author-structure}
     */
    export interface AuthorStructure {
        name: string;
        url?: string;
        icon_url?: string;
        proxy_icon_url?: string;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/channel#embed-object-embed-footer-structure}
     */
    export interface FooterStructure {
        text: string;
        icon_url?: string;
        proxy_icon_url?: string;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/channel#embed-object-embed-field-structure}
     */
    export interface FieldStructure {
        name: string;
        value: string;
        inline?: boolean;
    }
}
