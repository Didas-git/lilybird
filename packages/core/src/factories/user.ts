import { PremiumType } from "../enums";

import type { UserStructure } from "../typings";
import type { Client } from "../client";
import { GuildMember } from "./guild";

export class User {
    public readonly id: string;
    public readonly username: string;
    public readonly discriminator: string;
    public readonly globalName: string | null;
    public readonly avatar: string | null;
    public readonly bot: boolean;
    public readonly system: boolean;
    public readonly mfaEnabled: boolean;
    public readonly banner: string | null | undefined;
    public readonly accentColor: number | null | undefined;
    public readonly locale: string | undefined;
    public readonly verified: boolean;
    public readonly email: string | null | undefined;
    public readonly flags: number;
    public readonly premiumType: PremiumType;
    public readonly publicFlags: number;
    public readonly avatarDecoration: string | undefined | null;
    public readonly member: GuildMember | undefined;

    public constructor(client: Client, user: UserStructure) {
        this.id = user.id;
        this.username = user.username;
        this.discriminator = user.discriminator;
        this.globalName = user.global_name;
        this.avatar = user.avatar;
        this.bot = user.bot ?? false;
        this.system = user.system ?? false;
        this.mfaEnabled = user.mfa_enabled ?? false;
        this.banner = user.banner;
        this.accentColor = user.accent_color;
        this.locale = user.locale;
        this.verified = user.verified ?? false;
        this.email = user.email;
        this.flags = user.flags ?? 0;
        this.premiumType = user.premium_type ?? PremiumType.None;
        this.publicFlags = user.public_flags ?? 0;
        this.avatarDecoration = user.avatar_decoration;

        if ("member" in user) this.member = new GuildMember(client, <never>user.member);
    }
}