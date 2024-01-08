export const enum ChannelType {
    GUILD_TEXT,
    DM,
    GUILD_VOICE,
    GROUP_DM,
    GUILD_CATEGORY,
    GUILD_ANNOUNCEMENT,
    ANNOUNCEMENT_THREAD = 10,
    PUBLIC_THREAD,
    PRIVATE_THREAD,
    GUILD_STAGE_VOICE,
    GUILD_DIRECTORY,
    GUILD_FORUM,
    GUILD_MEDIA
}

export const enum OverwriteType {
    ROLE,
    MEMBER
}

export const enum VideoQualityMode {
    AUTO = 1,
    FULL
}

export const enum ChannelFlags {
    PINNED = 2,
    REQUIRE_TAG = 16,
    HIDE_MEDIA_DOWNLOAD_OPTIONS = 32768
}

export const enum SortOrderType {
    LATEST_ACTIVITY,
    CREATION_DATE
}

export const enum ForumLayoutType {
    NOT_SET,
    LIST_VIEW,
    GALLERY_VIEW
}

export const enum AllowedMentionType {
    RoleMentions = "roles",
    UserMentions = "users",
    EveryoneMentions = "everyone"
}
