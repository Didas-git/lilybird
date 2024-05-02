import type { AutoModerationActionType, AutoModerationEventType, AutoModerationKeywordPresetType, AutoModerationTriggerType } from "#enums";

export declare namespace AutoModeration {
    /**
     * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-auto-moderation-rule-structure}
     */
    export interface RuleStructure {
        id: string;
        guild_id: string;
        name: string;
        creator_id: string;
        event_type: AutoModerationEventType;
        trigger_type: AutoModerationTriggerType;
        trigger_metadata: TriggerMetadata;
        actions: Array<ActionStructure>;
        enabled: true;
        exempt_roles: Array<string>;
        exempt_channels: Array<string>;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-rule-object-trigger-metadata}
     */
    export interface TriggerMetadata {
        keyword_filter?: Array<string>;
        regex_patterns?: Array<string>;
        presets?: Array<AutoModerationKeywordPresetType>;
        allow_list?: Array<string>;
        mention_total_limit?: number;
        mention_raid_protection_enabled?: boolean;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/auto-moderation#auto-moderation-action-object-auto-moderation-action-structure}
     */
    export interface ActionStructure {
        type: AutoModerationActionType;
        metadata?: {
            channel_id: string,
            duration_seconds: number,
            custom_message?: string
        };
    }

    export interface CreateJSONParams {
        name: string;
        event_type: AutoModerationEventType;
        trigger_type: AutoModerationTriggerType;
        trigger_metadata?: TriggerMetadata;
        actions: Array<ActionStructure>;
        enabled?: boolean;
        exempt_roles?: Array<string>;
        exempt_channels?: Array<string>;
        reason?: string;
    }
}
