import { User } from "./user";

import type { GuildMemberStructure } from "../typings";
import type { Client } from "../client";

export interface PartialGuildMember extends Omit<GuildMember, "user"> {
    readonly user: undefined;
}

export class GuildMember {
    public readonly user!: User;
    public readonly nick: string | undefined | null;
    public readonly avatar: string | undefined | null;
    public readonly roles: Array<string>;
    public readonly joinedAt: Date;
    public readonly premiumSince: Date | undefined;
    public readonly deaf: boolean;
    public readonly mute: boolean;
    public readonly flags: number;
    public readonly pending: boolean;
    public readonly permissions: string | undefined;
    public readonly communicationDisabledUntil: Date | undefined;

    //@ts-expect-error Still unused
    readonly #client: Client;

    public constructor(client: Client, member: GuildMemberStructure) {
        this.#client = client;

        this.nick = member.nick;
        this.avatar = member.avatar;
        this.roles = member.roles;
        this.joinedAt = new Date(member.joined_at);
        this.deaf = member.deaf;
        this.mute = member.mute;
        this.flags = member.flags;
        this.pending = member.pending ?? false;
        this.permissions = member.permissions;

        member.user && (this.user = new User(member.user));
        member.premium_since && (this.premiumSince = new Date(member.premium_since));
        member.communication_disabled_until && (this.communicationDisabledUntil = new Date(member.communication_disabled_until));
    }
}