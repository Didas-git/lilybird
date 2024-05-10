import type { ApplicationCommandOptionType, ApplicationCommandPermissionType, ApplicationCommandType, ChannelType } from "#enums";
import type { ResolvedDataStructure } from "./others.js";
import type { Localizations as _Localizations } from "./localizations.js";

import { ApplicationCommandOption } from "./application-command-options.js";

declare namespace LocalizedApplicationCommand {
    export interface GlobalStructure extends ApplicationCommand.GlobalStructure, _Localizations.Localized {
        options?: Array<ApplicationCommandOption.Localized.Structure>;
    }

    export interface GuildStructure extends ApplicationCommand.GuildStructure, _Localizations.Localized {
        options?: Array<ApplicationCommandOption.Localized.Structure>;
    }

}

declare namespace LocalizationsApplicationCommand {
    export interface GlobalStructure extends ApplicationCommand.GlobalStructure, _Localizations.Base {
        options?: Array<ApplicationCommandOption.Localizations.Structure>;
    }

    export interface GuildStructure extends ApplicationCommand.GuildStructure, _Localizations.Base {
        options?: Array<ApplicationCommandOption.Localizations.Structure>;
    }

}

export declare namespace ApplicationCommand {
    export import Localizations = LocalizationsApplicationCommand;
    export import Localized = LocalizedApplicationCommand;
    export import Option = ApplicationCommandOption;

    /**
     * @see {@link https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-structure}
     */
    export type Structure = Localizations.GlobalStructure | Localizations.GuildStructure;

    export interface GlobalStructure {
        id: string;
        type?: ApplicationCommandType;
        application_id: string;
        name: string;
        description: string;
        options?: Array<Option.Structure>;
        default_member_permissions: string | null;
        dm_permission: boolean;
        nsfw?: boolean;
        version: number;
    }

    export interface GuildStructure {
        id: string;
        type?: ApplicationCommandType;
        application_id: string;
        guild_id: string;
        name: string;
        description: string;
        options?: Array<Option.Structure>;
        default_member_permissions: string | null;
        nsfw?: boolean;
        version: number;
    }

    // Sure... We need better naming
    interface OptionStructureWithoutNarrowing {
        type: ApplicationCommandOptionType;
        name: string;
        description: string;
        required?: boolean;
        choices?: Array<Option.ChoiceStructure>;
        options?: Array<Option.Structure>;
        channel_types?: Array<ChannelType>;
        min_value?: number;
        max_value?: number;
        min_length?: number;
        max_length?: number;
        autocomplete?: boolean;
    }

    export interface DataStructure {
        id: string;
        name: string;
        type: ApplicationCommandType;
        resolved?: ResolvedDataStructure;
        options?: Array<InteractionDataOptionStructure>;
        guild_id?: string;
        target_id?: string;
    }

    export interface InteractionDataOptionStructure {
        name: string;
        type: ApplicationCommandOptionType;
        value?: string | number | boolean;
        options?: Array<InteractionDataOptionStructure>;
        focused?: boolean;
    }

    export interface GuildPermissionsStructure {
        id: string;
        application_id: string;
        guild_id: string;
        permissions: Array<PermissionsStructure>;
    }

    export interface PermissionsStructure {
        id: string;
        type: ApplicationCommandPermissionType;
        permission: boolean;
    }

    export namespace Create {
        export interface ApplicationCommandJSONParams extends _Localizations.Base {
            name: string;
            description?: string;
            options?: Array<ApplicationCommandOption.Structure>;
            default_member_permissions?: string | null;
            dm_permission?: boolean | null;
            type?: ApplicationCommandType;
            nsfw?: boolean;
        }
    }
}
