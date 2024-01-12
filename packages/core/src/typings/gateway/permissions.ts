import type { RoleFlags } from "#enums";

export interface RoleStructure {
    id: string;
    name: string;
    color: number;
    hoist: boolean;
    icon?: string | null;
    unicode_emoji?: string | null;
    position: number;
    permissions: string;
    managed: boolean;
    mentionable: boolean;
    tags?: RoleTagsStructure;
    flags: RoleFlags;
}

/** Tags with type null represent booleans. They will be present and set to null if they are "true", and will be not present if they are "false". */
export interface RoleTagsStructure {
    bot_id?: string;
    integration_id?: string;
    premium_subscriber?: null;
    subscription_listing_id?: string;
    available_for_purchase?: null;
    guild_connections?: null;
}
