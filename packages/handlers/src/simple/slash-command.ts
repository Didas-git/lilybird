import type { ApplicationCommandData, AutocompleteData, GuildInteraction, Interaction } from "@lilybird/transformers";
import type { POSTApplicationCommandStructure, Awaitable } from "lilybird";

export interface GlobalSlashCommand {
    data: POSTApplicationCommandStructure;
    post: "GLOBAL";
    autocomplete?: (interaction: Interaction<AutocompleteData>) => Awaitable<any>;
    run: (interaction: Interaction<ApplicationCommandData>) => Awaitable<any>;
}

export interface GuildSlashCommand {
    data: POSTApplicationCommandStructure;
    post: Guild;
    autocomplete?: (interaction: GuildInteraction<AutocompleteData>) => Awaitable<any>;
    run: (interaction: GuildInteraction<ApplicationCommandData>) => Awaitable<any>;
}

export type SlashCommand = GuildSlashCommand | GlobalSlashCommand;

type Guild = `${number}` | Array<`${number}`>;
