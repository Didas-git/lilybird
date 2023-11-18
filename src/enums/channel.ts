export enum ChannelType {
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

export enum OverwriteType {
    ROLE,
    MEMBER
}

export enum VideoQualityMode {
    AUTO = 1,
    FULL
}

export enum ChannelFlags {
    PINNED = 2,
    REQUIRE_TAG = 16,
    HIDE_MEDIA_DOWNLOAD_OPTIONS = 32768
}

export enum SortOrderType {
    LATEST_ACTIVITY,
    CREATION_DATE
}

export enum ForumLayoutType {
    NOT_SET,
    LIST_VIEW,
    GALLERY_VIEW
}

export enum AllowedMentionType {
    RoleMentions = "roles",
    UserMentions = "users",
    EveryoneMentions = "everyone"
}