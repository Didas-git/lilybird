import type {
    GuildScheduledEventEntityMetadata,
    DefaultReactionStructure,
    GuildMemberStructure,
    OverwriteStructure,
    ForumTagStructure,
    ChannelStructure,
    StickerStructure,
    EmojiStructure,
    GuildStructure,
    GuildFeatures,
    RoleStructure,
    UserStructure,
    ImageData
} from "../index.js";

import type {
    DefaultMessageNotificationLevel,
    GuildScheduledEventPrivacyLevel,
    GuildScheduledEventEntityType,
    ExplicitContentFilterLevel,
    SystemChannelFlags,
    VerificationLevel,
    VideoQualityMode,
    ForumLayoutType,
    OnboardingMode,
    SortOrderType,
    ChannelType,
    PromptType,
    Locale
} from "#enums";

export interface CreateGuildStructure {
    name: string;
    /** Image Data */
    icon?: string;
    verification_level?: VerificationLevel;
    default_message_notifications?: DefaultMessageNotificationLevel;
    explicit_content_filter?: ExplicitContentFilterLevel;
    roles?: Array<RoleStructure>;
    channels?: Partial<ChannelStructure>;
    afk_channel_id?: string;
    afk_timeout?: number;
    system_channel_id?: string;
    system_channel_flags?: SystemChannelFlags;
}

export interface GuildPreviewStructure {
    id: string;
    name: string;
    icon: string | null;
    splash: string | null;
    discovery_splash: string | null;
    emojis: Array<EmojiStructure>;
    features: Array<GuildFeatures>;
    approximate_member_count: number;
    approximate_presence_count: number;
    description: string | null;
    stickers: Array<StickerStructure>;
}

export interface ModifyGuildStructure {
    reason?: string;
    name?: string;
    verification_level?: VerificationLevel | null;
    default_message_notifications?: DefaultMessageNotificationLevel | null;
    explicit_content_filter?: ExplicitContentFilterLevel | null;
    afk_channel_id?: string | null;
    afk_timeout?: number;
    /** Image Data */
    icon?: string;
    owner_id?: string;
    /** Image Data */
    splash?: string | null;
    /** Image Data */
    discovery_splash?: string | null;
    /** Image Data */
    banner?: string | null;
    system_channel_id?: string | null;
    system_channel_flags?: SystemChannelFlags;
    rules_channel_id?: string | null;
    public_updates_channel_id?: string | null;
    preferred_locale?: Locale | null;
    features?: Array<GuildFeatures>;
    description?: string | null;
    premium_progress_bar_enabled?: boolean;
    safety_alerts_channel_id?: string | null;
}

export interface CreateGuildChannelStructure {
    reason?: string;
    name: string;
    type?: ChannelType | null;
    topic?: string | null;
    bitrate?: number | null;
    user_limit?: number | null;
    rate_limit_per_user?: number | null;
    position?: number | null;
    permission_overwrites?: Array<Partial<OverwriteStructure>> | null;
    parent_id?: string | null;
    nsfw?: boolean | null;
    rtc_region?: string | null;
    video_quality_mode?: VideoQualityMode | null;
    default_auto_archive_duration?: number | null;
    default_reaction_emoji?: DefaultReactionStructure | null;
    available_tags?: Array<ForumTagStructure> | null;
    default_sort_order?: SortOrderType | null;
    default_forum_layout?: ForumLayoutType | null;
    default_thread_rate_limit_per_user?: number | null;
}

export interface ModifyChannelPositionStructure {
    id: string;
    position?: number | null;
    lock_permissions?: boolean | null;
    parent_id?: string | null;
}

export interface BanStructure {
    reason: string | null;
    user: UserStructure;
}

export interface APIRoleStructure {
    reason?: string;
    name: string;
    permissions: string;
    color: number;
    hoist: boolean;
    /** Image Data */
    icon: string | null;
    unicode_emoji: string | null;
    mentionable: boolean;
}

export interface VoiceRegionStructure {
    id: string;
    name: string;
    optimal: boolean;
    deprecated: boolean;
    custom: boolean;
}

export interface GuildWidgetSettingsStructure {
    enabled: boolean;
    channel_id: string | null;
}

export interface GuildWidgetStructure {
    id: string;
    name: string;
    instant_invite: string | null;
    channels: Array<Partial<ChannelStructure>>;
    members: Array<Partial<GuildMemberStructure>>;
    presence_count: number;
}

export interface GuildOnboardingStructure {
    guild_id: string;
    prompts: Array<OnboardingPromptStructure>;
    default_channel_ids: Array<string>;
    enabled: boolean;
    mode: OnboardingMode;
}

export interface OnboardingPromptStructure {
    id: string;
    type: PromptType;
    options: Array<OnboardingPromptOptionStructure>;
    title: string;
    single_select: boolean;
    required: boolean;
    in_onboarding: boolean;
}

export interface OnboardingPromptOptionStructure {
    id: string;
    channel_ids: Array<string>;
    role_ids: Array<string>;
    emoji?: EmojiStructure;
    emoji_id?: string;
    emoji_name?: string;
    emoji_animated?: boolean;
    title: string;
    description: string | null;
}

export interface CreateGuildScheduledEventStructure {
    channel_id?: string;
    entity_metadata?: GuildScheduledEventEntityMetadata;
    name: string;
    privacy_level: GuildScheduledEventPrivacyLevel;
    /* ISO8601 Timestamp */
    scheduled_start_time: string;
    /* ISO8601 Timestamp */
    scheduled_end_time?: string;
    description?: string;
    entity_type: GuildScheduledEventEntityType;
    image?: ImageData;
    reason?: string;
}

export interface GuildTemplateStructure {
    code: string;
    name: string;
    description: string | null;
    usage_count: number;
    creator_id: string;
    creator: UserStructure;
    /* ISO8601 Timestamp */
    created_at: string;
    /* ISO8601 Timestamp */
    updated_at: string;
    source_guild_id: string;
    serialized_source_guild: Partial<GuildStructure>;
    is_dirty: boolean | null;
}
