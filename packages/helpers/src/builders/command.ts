import type { LocalizationsShared, POSTApplicationCommandStructure, PermissionFlag, StringApplicationCommandOptionStructure } from "lilybird";
import { ApplicationCommandOptionType, ApplicationCommandType } from "lilybird";

export class ApplicationCommandBuilder {
    readonly #command: POSTApplicationCommandStructure = <never>{};

    public constructor(type: ApplicationCommandType = ApplicationCommandType.CHAT_INPUT) {
        this.#command.type = type;
    }

    public setName(name: string): this {
        this.#command.name = name;
        return this;
    }

    public setNameLocalizations(localizations: POSTApplicationCommandStructure["name_localizations"]): this {
        this.#command.name_localizations = localizations;
        return this;
    }

    public setDescription(description: string): this {
        this.#command.description = description;
        return this;
    }

    public setDescriptionLocalizations(localizations: POSTApplicationCommandStructure["description_localizations"]): this {
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

    public setDefaultMemberPermissions(bitfield: number | bigint | Array<PermissionFlag>): this {
        if (Array.isArray(bitfield)) bitfield = bitfield.reduce((a, b) => a | b, 0n);

        this.#command.default_member_permissions = bitfield.toString();
        return this;
    }

    public toJSON(): POSTApplicationCommandStructure {
        return this.#command;
    }
}

export class StringOptionBuilder {
    readonly #option: StringApplicationCommandOptionStructure = <never>{ type: ApplicationCommandOptionType.STRING };

    public setName(name: string): this {
        this.#option.name = name;
        return this;
    }

    public setNameLocalizations(localizations: LocalizationsShared["name_localizations"]): this {
        this.#option.name_localizations = localizations;
        return this;
    }

    public setDescription(description: string): this {
        this.#option.description = description;
        return this;
    }

    public setDescriptionLocalizations(localizations: LocalizationsShared["description_localizations"]): this {
        this.#option.description_localizations = localizations;
        return this;
    }

    public setRequired(required: boolean): this {
        this.#option.required = required;
        return this;
    }

    public toJSON(): StringApplicationCommandOptionStructure {
        return this.#option;
    }
}
