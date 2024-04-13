import type { ApplicationCommandData, AutocompleteData, GuildInteraction, Interaction } from "@lilybird/transformers";
import type { POSTApplicationCommandStructure, Awaitable } from "lilybird";

type Guild = `${number}` | Array<`${number}`>;

export interface GlobalApplicationCommand {
    data: POSTApplicationCommandStructure;
    post: "GLOBAL";
    autocomplete?: (interaction: Interaction<AutocompleteData>) => Awaitable<any>;
    run: (interaction: Interaction<ApplicationCommandData>) => Awaitable<any>;
}

export interface GuildApplicationCommand {
    data: POSTApplicationCommandStructure;
    post: Guild;
    autocomplete?: (interaction: GuildInteraction<AutocompleteData>) => Awaitable<any>;
    run: (interaction: GuildInteraction<ApplicationCommandData>) => Awaitable<any>;
}

export type ApplicationCommand = GuildApplicationCommand | GlobalApplicationCommand;

