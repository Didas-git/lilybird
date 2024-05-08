export const enum AutoModerationEventType {
    MESSAGE_SEND = 1
}

export const enum AutoModerationTriggerType {
    KEYWORD = 1,
    SPAM = 3,
    KEYWORD_PRESET,
    MENTION_SPAM
}

export const enum AutoModerationKeywordPresetType {
    PROFANITY = 1,
    SEXUAL_CONTENT,
    SLURS
}

export const enum AutoModerationActionType {
    BLOCK_MESSAGE = 1,
    SEND_ALERT_MESSAGE,
    TIMEOUT
}
