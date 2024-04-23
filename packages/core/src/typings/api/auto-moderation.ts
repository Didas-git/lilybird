import type { AutoModerationActionStructure, AutoModerationTriggerMetadata } from "../shared/auto-moderation.js";
import type { AutoModerationEventType, AutoModerationTriggerType } from "../../enums/auto-moderation.js";

export interface POSTAutoModerationRule {
    name: string;
    event_type: AutoModerationEventType;
    trigger_type: AutoModerationTriggerType;
    trigger_metadata?: AutoModerationTriggerMetadata;
    actions: Array<AutoModerationActionStructure>;
    enabled?: boolean;
    exempt_roles?: Array<string>;
    exempt_channels?: Array<string>;
    reason?: string;
}
