export const enum MessageType {
    DEFAULT,
    RECIPIENT_ADD,
    RECIPIENT_REMOVE,
    CALL,
    CHANNEL_NAME_CHANGE,
    CHANNEL_ICON_CHANGE,
    CHANNEL_PINNED_MESSAGE,
    USER_JOIN,
    GUILD_BOOST,
    GUILD_BOOST_TIER_1,
    GUILD_BOOST_TIER_2,
    GUILD_BOOST_TIER_3,
    CHANNEL_FOLLOW_ADD,
    GUILD_DISCOVERY_DISQUALIFIED = 14,
    GUILD_DISCOVERY_REQUALIFIED,
    GUILD_DISCOVERY_GRACE_PERIOD_INITIAL_WARNING,
    GUILD_DISCOVERY_GRACE_PERIOD_FINAL_WARNING,
    THREAD_CREATED,
    REPLY,
    CHAT_INPUT_COMMAND,
    THREAD_STARTER_MESSAGE,
    GUILD_INVITE_REMINDER,
    CONTEXT_MENU_COMMAND,
    AUTO_MODERATION_ACTION,
    ROLE_SUBSCRIPTION_PURCHASE,
    INTERACTION_PREMIUM_UPSELL,
    STAGE_START,
    STAGE_END,
    STAGE_SPEAKER,
    STAGE_TOPIC = 31,
    GUILD_APPLICATION_PREMIUM_SUBSCRIPTION,
    POLL_RESULT = 46
}

export const enum MessageFlags {
    CROSSPOSTED = 1,
    IS_CROSSPOST = 2,
    SUPPRESS_EMBEDS = 4,
    SOURCE_MESSAGE_DELETED = 8,
    URGENT = 16,
    HAS_THREAD = 32,
    EPHEMERAL = 64,
    LOADING = 128,
    FAILED_TO_MENTION_SOME_ROLES_IN_THREAD = 256,
    SUPPRESS_NOTIFICATIONS = 4096,
    IS_VOICE_MESSAGE = 8192
}

export const enum AttachmentFlags {
    IS_REMIX = 4
}

export const enum EmbedType {
    Rich = "rich",
    Image = "image",
    Video = "video",
    Gif = "gifv",
    Article = "article",
    Link = "link",
    PollResult = "poll_result"
}

export const enum MessageActivityType {
    JOIN = 1,
    SPECTATE,
    LISTEN,
    JOIN_REQUEST = 5
}

export const enum StickerType {
    STANDARD = 1,
    GUILD
}

export const enum StickerFormatType {
    PNG = 1,
    APNG,
    LOTTIE,
    GIF
}
