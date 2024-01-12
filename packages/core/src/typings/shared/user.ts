import type { Locale, PremiumType, UserFlags } from "#enums";

export interface UserStructure {
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
    flags?: UserFlags;
    premium_type?: PremiumType;
    public_flags?: UserFlags;
    avatar_decoration?: string | null;
}
