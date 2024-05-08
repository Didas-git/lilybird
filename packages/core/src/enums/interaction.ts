export const enum InteractionType {
    PING = 1,
    APPLICATION_COMMAND,
    MESSAGE_COMPONENT,
    APPLICATION_COMMAND_AUTOCOMPLETE,
    MODAL_SUBMIT
}

export const enum InteractionContextType {
    GUILD = 0,
    BOT_DM,
    PRIVATE_CHANNEL
}

export const enum ApplicationCommandType {
    CHAT_INPUT = 1,
    USER,
    MESSAGE
}

export const enum ApplicationCommandOptionType {
    SUB_COMMAND = 1,
    SUB_COMMAND_GROUP,
    STRING,
    INTEGER,
    BOOLEAN,
    USER,
    CHANNEL,
    ROLE,
    MENTIONABLE,
    NUMBER,
    ATTACHMENT
}

export const enum ApplicationCommandPermissionType {
    ROLE = 1,
    USER,
    CHANNEL
}

export const enum ComponentType {
    ActionRow = 1,
    Button,
    StringSelect,
    TextInput,
    UserSelect,
    RoleSelect,
    MentionableSelect,
    ChannelSelect
}

export const enum ButtonStyle {
    Primary = 1,
    Secondary,
    Success,
    Danger,
    Link
}

export const enum TextInputStyle {
    Short = 1,
    Paragraph
}

export const enum EntitlementType {
    APPLICATION_SUBSCRIPTION = 8
}

export const enum InteractionCallbackType {
    PONG = 1,
    CHANNEL_MESSAGE_WITH_SOURCE = 4,
    DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
    DEFERRED_UPDATE_MESSAGE,
    UPDATE_MESSAGE,
    APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
    MODAL,
    PREMIUM_REQUIRED
}
