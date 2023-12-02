/* eslint-disable @typescript-eslint/naming-convention */
import { ApplicationCommandOptionType, ApplicationCommandType, type Locale, type PermissionFlag } from "../enums";

import type {
    SubCommandApplicationCommandOptionStructure,
    NumericApplicationCommandOptionStructure,
    ApplicationCommandOptionChoiceStructure,
    StringApplicationCommandOptionStructure,
    BaseApplicationCommandOptionStructure,
    ApplicationCommandOptionStructure,
    POSTApplicationCommandStructure,
    CommandWithAutocomplete
} from "../typings";

export function ApplicationCommand({
    name,
    description,
    defaultMemberPermissions,
    dmPermission,
    name_localizations,
    description_localizations,
    nsfw,
    children
}: {
    name: string,
    description: string,
    defaultMemberPermissions?: Array<PermissionFlag> | null,
    dmPermission?: boolean | null,
    nsfw?: boolean,
    name_localizations?: Record<Locale, string> | null,
    description_localizations?: Record<Locale, string> | null,
    children?: Array<ApplicationCommandOptionStructure>
}): POSTApplicationCommandStructure {

    children != null && !Array.isArray(children) && (children = [children]);

    return {
        type: ApplicationCommandType.CHAT_INPUT,
        name,
        description,
        dm_permission: dmPermission,
        name_localizations,
        description_localizations,
        nsfw,
        default_member_permissions: defaultMemberPermissions?.reduce((prev, curr) => prev | curr, 0n).toString(),
        options: children
    };
}

type CommandWithChildren<T> = T & { children?: Array<ApplicationCommandOptionChoiceStructure> };

function commandComponent(type: ApplicationCommandOptionType, data: Partial<ApplicationCommandOptionStructure>): ApplicationCommandOptionStructure {
    return <never>{
        type,
        ...data
    };
}

export function CommandOptions(props: ApplicationCommandOptionChoiceStructure): ApplicationCommandOptionChoiceStructure {
    return props;
}

export function SubCommandOption(props: Omit<(Omit<SubCommandApplicationCommandOptionStructure, "options">
    & { children: Array<ApplicationCommandOptionStructure> }), "type">): ApplicationCommandOptionStructure {
    let { children: options, ...obj } = props;
    !Array.isArray(options) && (options = [options]);
    return commandComponent(ApplicationCommandOptionType.SUB_COMMAND, { ...obj, options });
}

export function SubCommandGroupOption(props: Omit<(Omit<SubCommandApplicationCommandOptionStructure, "options">
    & { children: Array<ApplicationCommandOptionStructure> }), "type">): ApplicationCommandOptionStructure {
    let { children: options, ...obj } = props;
    !Array.isArray(options) && (options = [options]);
    return commandComponent(ApplicationCommandOptionType.SUB_COMMAND_GROUP, { ...obj, options });
}

type StringCommandOption = Omit<StringApplicationCommandOptionStructure, "type">;

export function StringOption(props: CommandWithChildren<StringCommandOption> | CommandWithAutocomplete<StringCommandOption>): ApplicationCommandOptionStructure {
    //@ts-expect-error The type does exist
    let { children: choices, ...obj } = props;
    choices != null && !Array.isArray(choices) && (choices = [choices]);
    return commandComponent(ApplicationCommandOptionType.STRING, { ...obj, choices });
}

type NumericCommandOption = Omit<NumericApplicationCommandOptionStructure, "type">;

export function IntegerOption(props: CommandWithChildren<NumericCommandOption> | CommandWithAutocomplete<NumericCommandOption>): ApplicationCommandOptionStructure {
    //@ts-expect-error The type does exist
    let { children: choices, ...obj } = props;
    choices != null && !Array.isArray(choices) && (choices = [choices]);
    return commandComponent(ApplicationCommandOptionType.INTEGER, { ...obj, choices });
}

export function BooleanOption(props: Omit<BaseApplicationCommandOptionStructure, "type">): ApplicationCommandOptionStructure {
    return commandComponent(ApplicationCommandOptionType.BOOLEAN, props);
}

export function UserOption(props: Omit<BaseApplicationCommandOptionStructure, "type">): ApplicationCommandOptionStructure {
    return commandComponent(ApplicationCommandOptionType.USER, props);
}

export function ChannelOption(props: Omit<BaseApplicationCommandOptionStructure, "type">): ApplicationCommandOptionStructure {
    return commandComponent(ApplicationCommandOptionType.CHANNEL, props);
}

export function RoleOption(props: Omit<BaseApplicationCommandOptionStructure, "type">): ApplicationCommandOptionStructure {
    return commandComponent(ApplicationCommandOptionType.ROLE, props);
}

export function MentionableOption(props: Omit<BaseApplicationCommandOptionStructure, "type">): ApplicationCommandOptionStructure {
    return commandComponent(ApplicationCommandOptionType.MENTIONABLE, props);
}

export function NumberOption(props: CommandWithChildren<NumericCommandOption> | CommandWithAutocomplete<NumericCommandOption>): ApplicationCommandOptionStructure {
    //@ts-expect-error The type does exist
    let { children: choices, ...obj } = props;
    choices != null && !Array.isArray(choices) && (choices = [choices]);
    return commandComponent(ApplicationCommandOptionType.NUMBER, { ...obj, choices });
}

export function AttachmentOption(props: Omit<BaseApplicationCommandOptionStructure, "type">): ApplicationCommandOptionStructure {
    return commandComponent(ApplicationCommandOptionType.ATTACHMENT, props);
}