import type { RoleFlags } from "#enums";
import type { DiscordImageData } from "./image-data.js";

export declare namespace Role {
    export interface Structure {
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
        tags?: TagsStructure;
        flags: RoleFlags;
    }

    /** Tags with type null represent booleans. They will be present and set to null if they are "true", and will be not present if they are "false". */
    export interface TagsStructure {
        bot_id?: string;
        integration_id?: string;
        premium_subscriber?: null;
        subscription_listing_id?: string;
        available_for_purchase?: null;
        guild_connections?: null;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/channel#role-subscription-data-object-role-subscription-data-object-structure}
     */
    export interface SubscriptionDataStructure {
        role_subscription_listing_id: string;
        tier_name: string;
        total_months_subscribed: number;
        is_renewal: boolean;
    }

    interface JSONParams {
        reason?: string;
        name: string;
        permissions: string;
        color: number;
        hoist: boolean;
        icon: DiscordImageData | null;
        unicode_emoji: string | null;
        mentionable: boolean;
    }
}
