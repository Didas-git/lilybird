export enum AuditLogEvent {
    GUILD_UPDATE = 1,
    CHANNEL_CREATE = 10,
    CHANNEL_UPDATE,
    CHANNEL_DELETE,
    CHANNEL_OVERWRITE_CREATE,
    CHANNEL_OVERWRITE_UPDATE,
    CHANNEL_OVERWRITE_DELETE,
    MEMBER_KICK = 20,
    MEMBER_PRUNE,
    MEMBER_BAN_ADD,
    MEMBER_BAN_REMOVE,
    MEMBER_UPDATE,
    MEMBER_ROLE_UPDATE,
    MEMBER_MOVE,
    MEMBER_DISCONNECT,
    BOT_ADD,
    ROLE_CREATE = 30,
    ROLE_UPDATE,
    ROLE_DELETE,
    INVITE_CREATE = 40,
    INVITE_UPDATE,
    INVITE_DELETE,
    WEBHOOK_CREATE = 50,
    WEBHOOK_UPDATE,
    WEBHOOK_DELETE,
    EMOJI_CREATE = 60,
    EMOJI_UPDATE,
    EMOJI_DELETE,
    MESSAGE_DELETE = 72,
    MESSAGE_BULK_DELETE,
    MESSAGE_PIN,
    MESSAGE_UNPIN,
    INTEGRATION_CREATE = 80,
    INTEGRATION_UPDATE,
    INTEGRATION_DELETE,
    STAGE_INSTANCE_CREATE,
    STAGE_INSTANCE_UPDATE,
    STAGE_INSTANCE_DELETE,
    STICKER_CREATE = 90,
    STICKER_UPDATE,
    STICKER_DELETE,
    GUILD_SCHEDULED_EVENT_CREATE = 100,
    GUILD_SCHEDULED_EVENT_UPDATE,
    GUILD_SCHEDULED_EVENT_DELETE,
    THREAD_CREATE = 110,
    THREAD_UPDATE,
    THREAD_DELETE,
    APPLICATION_COMMAND_PERMISSION_UPDATE = 121,
    AUTO_MODERATION_RULE_CREATE = 140,
    AUTO_MODERATION_RULE_UPDATE,
    AUTO_MODERATION_RULE_DELETE,
    AUTO_MODERATION_BLOCK_MESSAGE,
    AUTO_MODERATION_FLAG_TO_CHANNEL,
    AUTO_MODERATION_USER_COMMUNICATION_DISABLED,
    CREATOR_MONETIZATION_REQUEST_CREATED = 150,
    CREATOR_MONETIZATION_TERMS_ACCEPTED,
}
