import type { GuildMemberStructure, OverwriteStructure, UserStructure } from "../index.js";

import type { VideoQualityMode, ForumLayoutType, SortOrderType, ChannelFlags, ChannelType } from "../../enums/index.js";

export interface BaseChannelStructure {
    id: string;
    type: ChannelType;
    last_pin_timestamp?: string | null;
    /** Only exists in resolved data */
    permissions?: string;
    flags?: ChannelFlags;
}

export interface GuildChannelStructure extends BaseChannelStructure {
    guild_id: string;
    name: string;
    position: number;
    permission_overwrites: Array<OverwriteStructure>;
    nsfw: boolean;
    topic: string | null;
    last_message_id: string | null;
    parent_id: string | null;
    default_auto_archive_duration: AutoArchiveDuration;
}

export interface GuildTextChannelStructure extends GuildChannelStructure {
    type: ChannelType.GUILD_TEXT;
    rate_limit_per_user: number;
}

export interface GuildAnnouncementChannelStructure extends GuildChannelStructure {
    type: ChannelType.GUILD_ANNOUNCEMENT;
}

export interface GuildVoiceChannelStructure extends BaseChannelStructure {
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

export interface DMChannelStructure extends BaseChannelStructure {
    type: ChannelType.DM;
    last_message_id: string | null;
    recipients: Array<UserStructure>;
}

export interface GroupDMChannelStructure extends BaseChannelStructure {
    type: ChannelType.GROUP_DM;
    last_message_id: string | null;
    recipients: Array<UserStructure>;
    name: string;
    icon: string | null;
    owner_id: string;
    application_id?: string;
    managed?: boolean;
}

export interface ChannelCategoryStructure extends BaseChannelStructure {
    type: ChannelType.GUILD_CATEGORY;
    permission_overwrites: Array<OverwriteStructure>;
    name: string;
    parent_id: null;
    nsfw: boolean;
    position: number;
    guild_id: string;
    rate_limit_per_user: number;
}

export interface ThreadChannelStructure extends BaseChannelStructure {
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

export interface ThreadLikeChannelStructure extends BaseChannelStructure {
    type: ChannelType.GUILD_FORUM | ChannelType.GUILD_MEDIA;
    available_tags?: Array<ForumTagStructure>;
    applied_tags?: Array<string>;
    default_thread_rate_limit_per_user?: number;
    default_sort_order?: SortOrderType | null;
    default_forum_layout?: ForumLayoutType;
    default_reaction_emoji?: DefaultReactionStructure | null;
}

export interface ProbablyBaseChannelsStructure extends GuildChannelStructure {
    type: ChannelType.GUILD_STAGE_VOICE | ChannelType.GUILD_DIRECTORY;
}

export type ChannelStructure =
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

export interface ThreadMemberStructure {
    id?: string;
    user_id?: string;
    /* ISO8601 Timestamp */
    join_timestamp: string;
    flags: number;
    member?: GuildMemberStructure;
}

export interface ForumTagStructure {
    id: string;
    name: string;
    moderated: boolean;
    emoji_id: string | null;
    emoji_name: string | null;
}

export interface DefaultReactionStructure {
    emoji_id: string | null;
    emoji_name: string | null;
}

export interface ChannelMentionStructure {
    id: string;
    guild_id: string;
    type: ChannelType;
    name: string;
}

export interface RoleSubscriptionDataStructure {
    role_subscription_listing_id: string;
    tier_name: string;
    total_months_subscribed: number;
    is_renewal: boolean;
}
