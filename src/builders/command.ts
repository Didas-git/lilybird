/* eslint-disable @typescript-eslint/naming-convention */
import { ApplicationCommandOptionType, ApplicationCommandType, type PermissionFlag } from "../enums";

import type {
    ApplicationCommandOptionChoiceStructure,
    ApplicationCommandOptionStructure,
    BaseApplicationCommandOptionStructure,
    CommandWithAutocomplete,
    NumericApplicationCommandOptionStructure,
    POSTApplicationCommandStructure,
    StringApplicationCommandOptionStructure,
    SubCommandApplicationCommandOptionStructure
} from "../typings";

export function Command({
    name,
    description,
    defaultMemberPermissions,
    nsfw,
    children
}: {
    name: string,
    description?: string,
    defaultMemberPermissions?: Array<PermissionFlag> | null,
    nsfw?: boolean,
    children?: Array<ApplicationCommandOptionStructure>
}): POSTApplicationCommandStructure {

    typeof children !== "undefined" && !Array.isArray(children) && (children = [children]);

    return {
        type: ApplicationCommandType.CHAT_INPUT,
        name,
        description,
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

export function CommandSubCommandOption(props: Omit<(Omit<SubCommandApplicationCommandOptionStructure, "options">
    & { children: Array<ApplicationCommandOptionStructure> }), "type">): ApplicationCommandOptionStructure {
    let { children: options, ...obj } = props;
    !Array.isArray(options) && (options = [options]);
    return commandComponent(ApplicationCommandOptionType.SUB_COMMAND, { ...obj, options });
}

export function CommandSubCommandGroupOption(props: Omit<(Omit<SubCommandApplicationCommandOptionStructure, "options">
    & { children: Array<ApplicationCommandOptionStructure> }), "type">): ApplicationCommandOptionStructure {
    let { children: options, ...obj } = props;
    !Array.isArray(options) && (options = [options]);
    return commandComponent(ApplicationCommandOptionType.SUB_COMMAND_GROUP, { ...obj, options });
}

export function CommandStringOption(props: Omit<CommandWithChildren<StringApplicationCommandOptionStructure>
    | CommandWithAutocomplete<StringApplicationCommandOptionStructure>, "type">): ApplicationCommandOptionStructure {
    //@ts-expect-error The type does exist
    let { children: choices, ...obj } = props;
    !Array.isArray(choices) && (choices = [choices]);
    return commandComponent(ApplicationCommandOptionType.STRING, { ...obj, choices });
}

export function CommandIntegerOption(props: Omit<CommandWithChildren<NumericApplicationCommandOptionStructure>
    | CommandWithAutocomplete<NumericApplicationCommandOptionStructure>, "type">): ApplicationCommandOptionStructure {
    //@ts-expect-error The type does exist
    let { children: choices, ...obj } = props;
    !Array.isArray(choices) && (choices = [choices]);
    return commandComponent(ApplicationCommandOptionType.INTEGER, { ...obj, choices });
}

export function CommandBooleanOption(props: Omit<BaseApplicationCommandOptionStructure, "type">): ApplicationCommandOptionStructure {
    return commandComponent(ApplicationCommandOptionType.BOOLEAN, props);
}

export function CommandUserOption(props: Omit<BaseApplicationCommandOptionStructure, "type">): ApplicationCommandOptionStructure {
    return commandComponent(ApplicationCommandOptionType.USER, props);
}

export function CommandChannelOption(props: Omit<BaseApplicationCommandOptionStructure, "type">): ApplicationCommandOptionStructure {
    return commandComponent(ApplicationCommandOptionType.CHANNEL, props);
}

export function CommandRoleOption(props: Omit<BaseApplicationCommandOptionStructure, "type">): ApplicationCommandOptionStructure {
    return commandComponent(ApplicationCommandOptionType.ROLE, props);
}

export function CommandMentionableOption(props: Omit<BaseApplicationCommandOptionStructure, "type">): ApplicationCommandOptionStructure {
    return commandComponent(ApplicationCommandOptionType.MENTIONABLE, props);
}

export function CommandNumberOption(props: Omit<CommandWithChildren<NumericApplicationCommandOptionStructure>
    | CommandWithAutocomplete<NumericApplicationCommandOptionStructure>, "type">): ApplicationCommandOptionStructure {
    //@ts-expect-error The type does exist
    let { children: choices, ...obj } = props;
    !Array.isArray(choices) && (choices = [choices]);
    return commandComponent(ApplicationCommandOptionType.NUMBER, { ...obj, choices });
}

export function CommandAttachmentOption(props: Omit<BaseApplicationCommandOptionStructure, "type">): ApplicationCommandOptionStructure {
    return commandComponent(ApplicationCommandOptionType.ATTACHMENT, props);
}