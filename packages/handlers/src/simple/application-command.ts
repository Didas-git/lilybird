import type { ApplicationCommandData, AutocompleteData, GuildInteraction, Interaction } from "@lilybird/transformers";
import type { ApplicationCommand, Awaitable } from "lilybird";

type Guild = `${number}` | Array<`${number}`>;

export interface GlobalApplicationCommand {
    data: ApplicationCommand.Create.ApplicationCommandJSONParams;
    post: "GLOBAL";
    autocomplete?: (interaction: Interaction<AutocompleteData>) => Awaitable<any>;
    run: (interaction: Interaction<ApplicationCommandData>) => Awaitable<any>;
}

export interface GuildApplicationCommand {
    data: ApplicationCommand.Create.ApplicationCommandJSONParams;
    post: Guild;
    autocomplete?: (interaction: GuildInteraction<AutocompleteData>) => Awaitable<any>;
    run: (interaction: GuildInteraction<ApplicationCommandData>) => Awaitable<any>;
}

export type ApplicationCommand = GuildApplicationCommand | GlobalApplicationCommand;

