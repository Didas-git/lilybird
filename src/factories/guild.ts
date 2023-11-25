import { User } from "./user";

import type { GuildMemberStructure } from "../typings";
import type { GuildMemberFlags } from "../enums";
import type { Client } from "../client";

export interface GuildMemberWithGuildId extends GuildMember {
    readonly guildId: string;
}

export interface PartialGuildMember extends Omit<GuildMember, "user"> {
    readonly user: undefined;
}

export interface ModifyMemberOptions {
    reason?: string;
    nick?: string;
    roles?: Array<string>;
    mute?: boolean;
    deaf?: boolean;
    channel_id?: string;
    communication_disabled_until?: Date | string;
    flags?: Array<GuildMemberFlags>;
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

    /** @internal */
    public readonly guildId: string | undefined;

    public readonly client: Client;

    public constructor(client: Client, member: GuildMemberStructure) {
        this.client = client;

        this.nick = member.nick;
        this.avatar = member.avatar;
        this.roles = member.roles;
        this.deaf = member.deaf;
        this.mute = member.mute;
        this.joinedAt = new Date(member.joined_at);
        // GuildMemberUpdate does not have `flags`
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        this.flags = member.flags ?? 0;
        this.pending = member.pending ?? false;
        this.permissions = member.permissions;

        member.user && (this.user = new User(client, member.user));
        member.premium_since && (this.premiumSince = new Date(member.premium_since));
        member.communication_disabled_until && (this.communicationDisabledUntil = new Date(member.communication_disabled_until));

        if ("guild_id" in member) this.guildId = <string>member.guild_id;
    }

    public async modify(options: ModifyMemberOptions): Promise<void> {
        if (!this.guildId) throw new Error("Something went wrong trying to modify the member");

        if (typeof options.communication_disabled_until !== "undefined" && options.communication_disabled_until instanceof Date) {
            options.communication_disabled_until = options.communication_disabled_until.toISOString();
        }

        if (typeof options.flags !== "undefined") {
            options.flags.reduce((prev, curr) => prev | curr, 0);
        }

        await this.client.rest.modifyGuildMember(this.guildId, this.user.id, <never>options);
    }
}