import { Component as _Component } from "./message-components.js";

import type { InteractionType, MessageActivityType, MessageType } from "#enums";
import type { LilybirdAttachment, ResolvedDataStructure } from "./others.js";
import type { Application } from "./application.js";
import type { Channel } from "./channel.js";
import type { Sticker } from "./sticker.js";
import type { Embed } from "./embed.js";
import type { Emoji } from "./emoji.js";
import type { Guild } from "./guild.js";
import type { User } from "./user.js";
import type { Role } from "./role.js";
import type { Poll } from "./poll.js";

export declare namespace Message {
    export import Component = _Component;
    /**
     * @see {@link https://discord.com/developers/docs/resources/channel#message-object-message-structure}
     */
    export interface Structure {
        id: string;
        channel_id: string;
        author: User.Structure;
        // This does not exist without the intent
        content: string;
        /** ISO8601 Timestamp */
        timestamp: string;
        /** ISO8601 Timestamp */
        edited_timestamp: string | null;
        tts: boolean;
        mention_everyone: boolean;
        mentions: Array<User.Structure>;
        mention_roles: Array<Role.Structure>;
        mention_channels?: Array<Channel.MentionStructure>;
        /** This does not exist without the intent */
        attachments: Array<Channel.AttachmentStructure>;
        /** This does not exist without the intent */
        embeds: Array<Embed.Structure>;
        reactions: Array<ReactionStructure>;
        nonce?: number | string;
        pinned: boolean;
        webhook_id?: string;
        type: MessageType;
        activity?: ActivityStructure;
        application?: Partial<Application.Structure>;
        application_id?: string;
        message_reference?: ReferenceStructure;
        /**
         * Bitfield of {@link MessageFlags}
         */
        flags?: number;
        referenced_message?: Structure | null;
        interaction?: InteractionStructure;
        thread?: Channel.Structure;
        /** This does not exist without the intent */
        components?: Array<Component.Structure>;
        sticker_items?: Array<Sticker.ItemStructure>;
        stickers?: Array<Sticker.Structure>;
        position?: number;
        role_subscription_data?: Role.SubscriptionDataStructure;
        resolved?: ResolvedDataStructure;
        poll?: Poll.Structure;
    }

    export interface GuildStructure extends Structure {
        guild_id: string;
        member: Partial<Guild.MemberStructure>;
        mentions: Array<User.Structure & { member?: Partial<Guild.MemberStructure> }>;
    }

    export interface InteractionStructure {
        id: string;
        type: InteractionType;
        name: string;
        user: User.Structure;
        member?: Partial<Guild.MemberStructure>;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/channel#message-reference-object-message-reference-structure}
     */
    export interface ReferenceStructure {
        message_id?: string;
        channel_id?: string;
        guild_id?: string;
        fail_if_not_exists?: boolean;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/channel#reaction-object-reaction-structure}
     */
    export interface ReactionStructure {
        count: number;
        count_details: ReactionCountDetailsStructure;
        me: boolean;
        me_burst: boolean;
        emoji: Partial<Emoji.Structure>;
        burst_colors: Array<number>;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/channel#reaction-count-details-object-reaction-count-details-structure}
     */
    export interface ReactionCountDetailsStructure {
        burst: number;
        normal: number;
    }

    export interface ActivityStructure {
        type: MessageActivityType;
        party_id?: string;
    }

    export interface CreateJSONParams {
        content?: string;
        nonce?: number | string;
        tts?: boolean;
        embeds?: Array<Embed.Structure>;
        allowed_mentions?: Channel.AllowedMentionsStructure;
        message_reference?: ReferenceStructure;
        components?: Array<Component.Structure>;
        sticker_ids?: Array<string>;
        files?: Array<LilybirdAttachment>;
        payload_json?: string;
        attachments?: Array<Partial<Channel.AttachmentStructure>>;
        flags?: number;
        enforce_nonce?: boolean;
        poll?: Poll.CreateStructure;
    }

    export interface EditJSONParams {
        content?: string;
        embeds?: Array<Embed.Structure>;
        flags?: number;
        allowed_mentions?: Channel.AllowedMentionsStructure;
        components?: Array<Component.Structure>;
        files?: Array<LilybirdAttachment>;
        payload_json?: string;
        attachments?: Array<Channel.AttachmentStructure>;
    }
}
