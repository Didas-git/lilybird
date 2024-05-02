import type { Guild } from "./guild.js";
import type { User } from "./user.js";

import type {
    AllowedMentionType,
    VideoQualityMode,
    ForumLayoutType,
    AttachmentFlags,
    OverwriteType,
    SortOrderType,
    ChannelFlags,
    ChannelType
} from "#enums";
import type { LilybirdAttachment } from "./others.js";
import type { Message } from "./message.js";
import type { Embed } from "./embed.js";

declare namespace ChannelModify {
    export interface DMChannelStructure {
        name?: string;
        icon?: string;
    }

    export interface GuildChannelStructure {
        name?: string;
        type?: ChannelType.GUILD_TEXT | ChannelType.GUILD_ANNOUNCEMENT;
        position?: number | null;
        topic?: string | null;
        nsfw?: boolean | null;
        rate_limit_per_user?: number | null;
        bitrate?: number | null;
        user_limit?: number | null;
        permission_overwrites?: Array<Partial<Channel.OverwriteStructure>>;
        parent_id?: string | null;
        rtc_region?: string | null;
        video_quality_mode?: VideoQualityMode | null;
        default_auto_archive_duration?: number;
        flags?: number;
        available_tags?: Array<Channel.ForumTagStructure>;
        default_reaction_emoji?: Channel.DefaultReactionStructure | null;
        default_thread_rate_limit_per_user?: number;
        default_sort_order?: SortOrderType | null;
        default_forum_layout?: ForumLayoutType | null;
    }

    export interface ThreadChannelStructure {
        name?: string;
        archived?: boolean;
        auto_archive_duration?: Channel.AutoArchiveDuration;
        locked?: boolean;
        invitable?: boolean;
        rate_limit_per_user?: number | null;
        flags?: number;
        applied_tags?: Array<string>;
    }
}

export declare namespace Channel {
    export import Modify = ChannelModify;

    /**
     * @see {@link https://discord.com/developers/docs/resources/channel#channel-object-channel-structure}
     */
    export interface Base {
        id: string;
        type: ChannelType;
        last_pin_timestamp?: string | null;
        /** Only exists in resolved data */
        permissions?: string;
        /**
         * Bitfield of {@link ChannelFlags}
         */
        flags?: number;
    }

    export interface BaseGuildChannelStructure extends Base {
        guild_id: string;
        position: number;
        permission_overwrites: Array<OverwriteStructure>;
        name: string;
        topic: string | null;
        nsfw: boolean;
        last_message_id: string | null;
        parent_id: string | null;
        default_auto_archive_duration: AutoArchiveDuration;
    }

    export interface GuildTextChannelStructure extends BaseGuildChannelStructure {
        type: ChannelType.GUILD_TEXT;
        rate_limit_per_user: number;
    }

    export interface GuildAnnouncementChannelStructure extends BaseGuildChannelStructure {
        type: ChannelType.GUILD_ANNOUNCEMENT;
    }

    export interface GuildVoiceChannelStructure extends Base {
        type: ChannelType.GUILD_VOICE;
        guild_id: string;
        name: string;
        position: number;
        permission_overwrites: Array<OverwriteStructure>;
        last_message_id: string | null;
        parent_id: string | null;
        nsfw: boolean;
        rate_limit_per_user: number;
        rtc_region: string | null;
        user_limit: number;
        bitrate: number;
        video_quality_mode?: VideoQualityMode;
    }

    export interface DMChannelStructure extends Base {
        type: ChannelType.DM;
        last_message_id: string | null;
        recipients: Array<User.Structure>;
    }

    export interface GroupDMChannelStructure extends Base {
        type: ChannelType.GROUP_DM;
        last_message_id: string | null;
        recipients: Array<User.Structure>;
        name: string;
        icon: string | null;
        owner_id: string;
        application_id?: string;
        managed?: boolean;
    }

    export interface ChannelCategoryStructure extends Base {
        type: ChannelType.GUILD_CATEGORY;
        permission_overwrites: Array<OverwriteStructure>;
        name: string;
        parent_id: null;
        nsfw: boolean;
        position: number;
        guild_id: string;
        rate_limit_per_user: number;
    }

    export interface ThreadChannelStructure extends Base {
        type: ChannelType.PUBLIC_THREAD | ChannelType.ANNOUNCEMENT_THREAD | ChannelType.PRIVATE_THREAD;
        guild_id: string;
        parent_id: string | null;
        owner_id: string;
        name: string;
        last_message_id: string | null;
        message_count: number;
        member_count: number;
        thread_metadata: ThreadMetadataStructure;
        total_message_sent: number;
        member?: ThreadMemberStructure;
        default_thread_rate_limit_per_user?: number;
    }

    export interface ThreadLikeChannelStructure extends Base {
        type: ChannelType.GUILD_FORUM | ChannelType.GUILD_MEDIA;
        available_tags?: Array<ForumTagStructure>;
        applied_tags?: Array<string>;
        default_thread_rate_limit_per_user?: number;
        default_sort_order?: SortOrderType | null;
        default_forum_layout?: ForumLayoutType;
        default_reaction_emoji?: DefaultReactionStructure | null;
    }

    export interface ProbablyBaseChannelsStructure extends BaseGuildChannelStructure {
        type: ChannelType.GUILD_STAGE_VOICE | ChannelType.GUILD_DIRECTORY;
    }

    export type Structure =
        | GuildTextChannelStructure
        | GuildAnnouncementChannelStructure
        | GuildVoiceChannelStructure
        | DMChannelStructure
        | GroupDMChannelStructure
        | ChannelCategoryStructure
        | ThreadChannelStructure
        | ThreadLikeChannelStructure
        | ProbablyBaseChannelsStructure;

    export type AutoArchiveDuration = 60 | 1440 | 4320 | 10080;

    /**
     * @see {@link https://discord.com/developers/docs/resources/channel#followed-channel-object-followed-channel-structure}
     */
    export interface FollowedChannelStructure {
        channel_id: string;
        webhook_id: string;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/channel#overwrite-object-overwrite-structure}
     */
    export interface OverwriteStructure {
        id: string;
        type: OverwriteType;
        allow: string;
        deny: string;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/channel#thread-metadata-object-thread-metadata-structure}
     */
    export interface ThreadMetadataStructure {
        archived: boolean;
        auto_archive_duration: AutoArchiveDuration;
        /* ISO8601 Timestamp */
        archive_timestamp: string;
        locked: boolean;
        invitable?: boolean;
        /* ISO8601 Timestamp */
        create_timestamp?: string | null;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/channel#thread-metadata-object-thread-metadata-structure}
     */
    export interface ThreadMemberStructure {
        id?: string;
        user_id?: string;
        /* ISO8601 Timestamp */
        join_timestamp: string;
        flags: number;
        member?: Guild.MemberStructure;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/channel#default-reaction-object-default-reaction-structure}
     */
    export interface DefaultReactionStructure {
        emoji_id: string | null;
        emoji_name: string | null;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/channel#forum-tag-object-forum-tag-structure}
     */
    export interface ForumTagStructure {
        id: string;
        name: string;
        moderated: boolean;
        emoji_id: string | null;
        emoji_name: string | null;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/channel#attachment-object-attachment-structure}
     */
    export interface AttachmentStructure {
        id: number | string;
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
        /**
         * Bitfield of {@link AttachmentFlags}
         */
        flags?: number;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/channel#channel-mention-object-channel-mention-structure}
     */
    export interface MentionStructure {
        id: string;
        guild_id: string;
        type: ChannelType;
        name: string;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/channel#allowed-mentions-object-allowed-mentions-structure}
     */
    export interface AllowedMentionsStructure {
        parse: Array<AllowedMentionType>;
        roles: Array<string>;
        users: Array<string>;
        replied_user: boolean;
    }

    export interface ForumThreadMessageJSONParams {
        content?: string;
        embeds?: Array<Embed.Structure>;
        allowed_mentions?: AllowedMentionsStructure;
        components?: Array<Message.Component.Structure>;
        sticker_ids?: Array<string>;
        attachments?: Array<Partial<AttachmentStructure>>;
        flags?: number;
    }

    export namespace Create {
        export interface ThreadFromMessageJSONParams {
            name: string;
            auto_archive_duration?: number;
            rate_limit_per_user?: number | null;
            reason?: string;
        }

        export interface ThreadJSONParams extends ThreadFromMessageJSONParams {
            /** https://discord.com/developers/docs/resources/channel#start-thread-without-message-json-params */
            type?: ChannelType;
            invitable?: boolean;
        }

        export interface ForumMediaThreadJSONParams extends ThreadFromMessageJSONParams {
            message: ForumThreadMessageJSONParams;
            applied_tags?: Array<string>;
            files?: Array<LilybirdAttachment>;
            payload_json?: string;
        }
    }
}
