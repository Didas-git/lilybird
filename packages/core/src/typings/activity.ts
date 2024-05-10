import type { ActivityFlags, ActivityType } from "#enums";

export type BotActivityStructure = Pick<ActivityStructure, "name" | "type" | "state" | "url">;

export interface ActivityStructure {
    name: string;
    type: ActivityType;
    url?: string | null;
    created_at: number;
    timestamps?: {
        start?: number,
        end?: number
    };
    application_id?: string;
    details?: string | null;
    state?: string | null;
    emoji?: {
        name: string,
        id?: string,
        animated?: boolean
    };
    party?: {
        id?: string,
        size?: [number, number]
    };
    assets?: {
        large_image?: string,
        large_text?: string,
        small_image?: string,
        small_text?: string
    };
    secrets?: {
        join?: string,
        spectate?: string,
        match?: string
    };
    instance?: boolean;
    /**
     * Bitfield of {@link ActivityFlags}
     */
    flags?: number;
    buttons?: Array<{
        label: string,
        url: string
    }>;
}
