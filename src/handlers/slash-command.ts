import type { ApplicationCommandData, AutocompleteData, GuildInteraction, Interaction } from "../factories/interaction";
import type { Awaitable, POSTApplicationCommandStructure } from "../typings";

export interface GlobalSlashCommand {
    data: POSTApplicationCommandStructure;
    post: "GLOBAL";
    autocomplete?: (interaction: Interaction<AutocompleteData>) => Awaitable<any>;
    run: (interaction: Interaction<ApplicationCommandData<undefined>>) => Awaitable<any>;
}

export interface GuildSlashCommand {
    data: POSTApplicationCommandStructure;
    post: Guild;
    autocomplete?: (interaction: GuildInteraction<AutocompleteData>) => Awaitable<any>;
    run: (interaction: GuildInteraction<ApplicationCommandData<undefined>>) => Awaitable<any>;
}

export type SlashCommand = GuildSlashCommand | GlobalSlashCommand;

type Guild = `${number}` | Array<`${number}`>;