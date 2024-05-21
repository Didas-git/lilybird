/* eslint-disable no-underscore-dangle */
import { ApplicationCommandOptionType } from "lilybird";

import type { ApplicationCommandData, AutocompleteData, Interaction } from "@lilybird/transformers";
import type { ApplicationCommand, Awaitable } from "lilybird";

export type StaticComponentListener = (interaction: Interaction) => Awaitable<unknown>;
export type ComponentListener = (interaction: Interaction) => Awaitable<unknown>;

// eslint-disable-next-line @typescript-eslint/naming-convention
type _SubCommandListenerCommandStructure = Omit<ApplicationCommand.Option.Base, "type">;
export type SubCommandListenerCommandStructure = _SubCommandListenerCommandStructure & { options?: _SubCommandListenerCommandStructure };

export interface IApplicationCommandHandler {
    execute: ((interaction: Interaction<ApplicationCommandData>) => Awaitable<unknown>);
    autocomplete?: ((interaction: Interaction<AutocompleteData>) => Awaitable<unknown>);
    readonly components?: Array<{ name: string, handler: StaticComponentListener }>;
}

export abstract class ApplicationCommandHandler {
    public readonly meta: { isGuildOnly: boolean, guildIds: Array<string> };

    readonly #data: ApplicationCommand.Create.ApplicationCommandJSONParams;
    readonly #components = new Map<string, ComponentListener>();

    /** @internal */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    public readonly __groups = new Map<string, Array<[string, (interaction: Interaction<ApplicationCommandData>) => Awaitable<unknown>]>>();
    /** @internal */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    public readonly __subs = new Map<string, (interaction: Interaction<ApplicationCommandData>) => Awaitable<unknown>>();

    public constructor({
        name,
        description,
        type,
        nsfw,
        ids,
        options,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        guild_command,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        name_localizations,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        description_localizations,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        default_member_permissions

    }: Omit<ApplicationCommand.Create.ApplicationCommandJSONParams, "options"> & (
        { guild_command?: false, ids?: undefined } | { guild_command?: true, ids: Array<string> }
    ) & { options?: Array<Exclude<ApplicationCommand.Option.Structure, ApplicationCommand.Option.SubCommandStructure>> }) {
        this.#data = {
            name,
            description,
            type,
            nsfw,
            options: <never>options,
            name_localizations,
            description_localizations,
            default_member_permissions
        };
        this.meta = { isGuildOnly: guild_command ?? false, guildIds: ids ?? [] };
    }

    public addComponentListener(id: string, handler: StaticComponentListener): void {
        this.#components.set(id, handler);
    }

    public addSubCommandListener(
        commands: [SubCommandListenerCommandStructure, SubCommandListenerCommandStructure?],
        handler: (interaction: Interaction<ApplicationCommandData>) => Awaitable<unknown>
    ): this {
        if (!Array.isArray(this.#data.options)) this.#data.options = [];

        if (typeof commands[1] === "undefined") {
            this.#data.options.push({
                type: ApplicationCommandOptionType.SUB_COMMAND,
                ...commands[0]
            });

            this.__subs.set(commands[0].name, handler);
        } else {
            if (!Array.isArray(commands[0].options)) commands[0].options = <never>[];
            commands[0].options.push({
                type: ApplicationCommandOptionType.SUB_COMMAND,
                ...commands[1]
            });

            this.#data.options.push({
                type: ApplicationCommandOptionType.SUB_COMMAND_GROUP,
                ...commands[0]
            });

            const group = this.__groups.get(commands[0].name);
            if (typeof group === "undefined")
                this.__groups.set(commands[0].name, [[commands[1].name, handler]]);
            else group.push([commands[1].name, handler]);
        }

        return this;
    }

    // TODO: public collect(interaction: Interaction.Structure, id: string);

    public toJSON(): ApplicationCommand.Create.ApplicationCommandJSONParams {
        return this.#data;
    }
}
