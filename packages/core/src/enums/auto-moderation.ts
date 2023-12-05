export enum AutoModerationEventType {
    MESSAGE_SEND = 1
}

export enum AutoModerationTriggerType {
    KEYWORD = 1,
    SPAM = 3,
    KEYWORD_PRESET,
    MENTION_SPAM
}

export enum AutoModerationKeywordPresetTypes {
    PROFANITY = 1,
    SEXUAL_CONTENT,
    SLURS
}

export enum AutoModerationActionType {
    BLOCK_MESSAGE = 1,
    SEND_ALERT_MESSAGE,
    TIMEOUT
}
