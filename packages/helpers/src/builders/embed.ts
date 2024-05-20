import { hexColorToNumber } from "../util.js";

import type { Embed, EmbedType } from "lilybird";

export class EmbedBuilder {
    readonly #embed: Embed.Structure = {};

    public title(text: string): this {
        this.#embed.title = text;
        return this;
    }

    public type(type: EmbedType): this {
        this.#embed.type = type;
        return this;
    }

    public description(text: string): this {
        this.#embed.description = text;
        return this;
    }

    public url(url: string): this {
        this.#embed.url = url;
        return this;
    }

    public timestamp(timestamp?: Date | string | number): this {
        const realTimestamp = typeof timestamp === "undefined"
            ? new Date().toISOString()
            : timestamp instanceof Date
                ? timestamp.toISOString()
                : typeof timestamp === "number"
                    ? new Date(timestamp).toISOString()
                    : timestamp;

        this.#embed.timestamp = realTimestamp;
        return this;
    }

    public color(color: string | number): this {
        const realColor = typeof color === "string"
            ? hexColorToNumber(color)
            : color;
        this.#embed.color = realColor;

        return this;
    }

    public footer(footer: Omit<Embed.FooterStructure, "proxy_icon_url">): this {
        this.#embed.footer = footer;
        return this;
    }

    public image(image: Omit<Embed.ImageStructure, "proxy_url">): this {
        this.#embed.image = image;
        return this;
    }

    public thumbnail(thumbnail: Omit<Embed.ThumbnailStructure, "proxy_url">): this {
        this.#embed.thumbnail = thumbnail;
        return this;
    }

    public video(video: Omit<Embed.VideoStructure, "proxy_url">): this {
        this.#embed.video = video;
        return this;
    }

    public provider(provider: Embed.ProviderStructure): this {
        this.#embed.provider = provider;
        return this;
    }

    public author(author: Omit<Embed.AuthorStructure, "proxy_icon_url">): this {
        this.#embed.author = author;
        return this;
    }

    public setFields(fields: Embed.Structure["fields"]): this {
        this.#embed.fields = fields;
        return this;
    }

    public addField(field: Embed.FieldStructure): this {
        if (!Array.isArray(this.#embed.fields)) this.#embed.fields = [];
        this.#embed.fields.push(field);
        return this;
    }

    public toJSON(): Embed.Structure {
        return this.#embed;
    }
}
