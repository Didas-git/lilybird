import type { Locale, PremiumType, UserFlags } from "#enums";

export declare namespace User {
    /**
     * @see {@link https://discord.com/developers/docs/resources/user#user-object-user-structure}
     */
    export interface Structure {
        id: string;
        username: string;
        discriminator: string;
        global_name: string | null;
        avatar: string | null;
        bot?: boolean;
        system?: boolean;
        mfa_enabled?: boolean;
        banner?: string | null;
        accent_color?: number | null;
        locale?: Locale;
        verified?: boolean;
        email?: string | null;
        /**
         * Bitfield of {@link UserFlags}
         */
        flags?: number;
        premium_type?: PremiumType;
        /**
         * Bitfield of {@link UserFlags}
         */
        public_flags?: number;
        avatar_decoration?: string | null;
    }
}
