import { ApplicationCommandOptionType, ApplicationCommandType } from "lilybird";

import type { ApplicationCommand, Localizations, PermissionFlags } from "lilybird";

export class ApplicationCommandBuilder {
    readonly #command: ApplicationCommand.Create.ApplicationCommandJSONParams = <never>{};

    public constructor(type: ApplicationCommandType = ApplicationCommandType.CHAT_INPUT) {
        this.#command.type = type;
    }

    public setName(name: string): this {
        this.#command.name = name;
        return this;
    }

    public setNameLocalizations(localizations: ApplicationCommand.Create.ApplicationCommandJSONParams["name_localizations"]): this {
        this.#command.name_localizations = localizations;
        return this;
    }

    public setDescription(description: string): this {
        this.#command.description = description;
        return this;
    }

    public setDescriptionLocalizations(localizations: ApplicationCommand.Create.ApplicationCommandJSONParams["description_localizations"]): this {
        this.#command.description_localizations = localizations;
        return this;
    }

    public setNSFW(nsfw: boolean): this {
        this.#command.nsfw = nsfw;
        return this;
    }

    public setDMPermission(allow: boolean): this {
        this.#command.dm_permission = allow;
        return this;
    }

    public setDefaultMemberPermissions(bitfield: number | bigint | Array<typeof PermissionFlags[keyof typeof PermissionFlags]>): this {
        if (Array.isArray(bitfield)) bitfield = bitfield.reduce((a, b) => a | b, 0n);

        this.#command.default_member_permissions = bitfield.toString();
        return this;
    }

    public toJSON(): ApplicationCommand.Create.ApplicationCommandJSONParams {
        return this.#command;
    }
}

export class StringOptionBuilder {
    readonly #option: ApplicationCommand.Option.StringStructure = <never>{ type: ApplicationCommandOptionType.STRING };

    public setName(name: string): this {
        this.#option.name = name;
        return this;
    }

    public setNameLocalizations(localizations: Localizations.Base["name_localizations"]): this {
        this.#option.name_localizations = localizations;
        return this;
    }

    public setDescription(description: string): this {
        this.#option.description = description;
        return this;
    }

    public setDescriptionLocalizations(localizations: Localizations.Base["description_localizations"]): this {
        this.#option.description_localizations = localizations;
        return this;
    }

    public setRequired(required: boolean): this {
        this.#option.required = required;
        return this;
    }

    public toJSON(): ApplicationCommand.Option.StringStructure {
        return this.#option;
    }
}
