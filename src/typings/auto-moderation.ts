import type {
    AutoModerationKeywordPresetTypes,
    AutoModerationTriggerType,
    AutoModerationActionType,
    AutoModerationEventType
} from "../enums";

export interface AutoModerationRuleStructure {
    id: string;
    guild_id: string;
    name: string;
    creator_id: string;
    event_type: AutoModerationEventType;
    trigger_type: AutoModerationTriggerType;
    trigger_metadata: {
        keyword_filter?: Array<string>,
        regex_patterns?: Array<string>,
        presets?: Array<AutoModerationKeywordPresetTypes>,
        allow_list?: Array<string>,
        mention_total_limit?: number,
        mention_raid_protection_enabled?: boolean
    };
    actions: Array<AutoModerationActionStructure>;
    enabled: true;
    exempt_roles: Array<string>;
    exempt_channels: Array<string>;
}

export interface AutoModerationActionStructure {
    type: AutoModerationActionType;
    metadata?: {
        channel_id: string,
        duration_seconds: number,
        custom_message?: string
    };
}