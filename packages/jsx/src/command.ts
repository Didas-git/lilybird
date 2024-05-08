/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/naming-convention */
import { ApplicationCommandOptionType, ApplicationCommandType } from "lilybird";

import type {
    ApplicationCommand as LilyApplicationCommand,
    PermissionFlags,
    Locale
} from "lilybird";

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
    defaultMemberPermissions?: Array<typeof PermissionFlags[keyof typeof PermissionFlags]> | null,
    dmPermission?: boolean | null,
    nsfw?: boolean,
    name_localizations?: Record<Locale, string> | null,
    description_localizations?: Record<Locale, string> | null,
    children?: Array<LilyApplicationCommand.Option.Structure>
}): LilyApplicationCommand.Create.ApplicationCommandJSONParams {
    if (children != null && !Array.isArray(children)) children = [children];

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

type CommandWithChildren<T> = T & { children?: Array<LilyApplicationCommand.Option.ChoiceStructure> };

function commandComponent(type: ApplicationCommandOptionType, data: Partial<LilyApplicationCommand.Option.Structure>): LilyApplicationCommand.Option.Structure {
    return <never>{
        type,
        ...data
    };
}

export function CommandOptions(props: LilyApplicationCommand.Option.ChoiceStructure): LilyApplicationCommand.Option.ChoiceStructure {
    return props;
}

export function SubCommandOption(props: Omit<
    Omit<LilyApplicationCommand.Option.SubCommandStructure, "options">
     & { children?: Array<LilyApplicationCommand.Option.Structure> }, "type"
>): LilyApplicationCommand.Option.Structure {
    let { children: options, ...obj } = props;
    if (options != null && !Array.isArray(options)) options = [options];

    return commandComponent(ApplicationCommandOptionType.SUB_COMMAND, { ...obj, options });
}

export function SubCommandGroupOption(props: Omit<
    Omit<LilyApplicationCommand.Option.SubCommandStructure, "options">
& { children: Array<LilyApplicationCommand.Option.Structure> }, "type"
>): LilyApplicationCommand.Option.Structure {
    let { children: options, ...obj } = props;
    if (!Array.isArray(options)) options = [options];

    return commandComponent(ApplicationCommandOptionType.SUB_COMMAND_GROUP, { ...obj, options });
}

type StringCommandOption = Omit<LilyApplicationCommand.Option.StringStructure, "type">;

export function StringOption(props: CommandWithChildren<StringCommandOption>
    | LilyApplicationCommand.Option.WithAutocomplete<LilyApplicationCommand.Option.StringStructure>): LilyApplicationCommand.Option.Structure {
    //@ts-expect-error The type does exist
    let { children: choices, ...obj } = props;
    if (choices != null && !Array.isArray(choices)) choices = [choices];

    return commandComponent(ApplicationCommandOptionType.STRING, { ...obj, choices });
}

type NumericCommandOption = Omit<LilyApplicationCommand.Option.NumericStructure, "type">;

export function IntegerOption(props: CommandWithChildren<NumericCommandOption>
    | LilyApplicationCommand.Option.WithAutocomplete<LilyApplicationCommand.Option.NumericStructure>): LilyApplicationCommand.Option.Structure {
    //@ts-expect-error The type does exist
    let { children: choices, ...obj } = props;
    if (choices != null && !Array.isArray(choices)) choices = [choices];

    return commandComponent(ApplicationCommandOptionType.INTEGER, { ...obj, choices });
}

export function BooleanOption(props: Omit<LilyApplicationCommand.Option.Base, "type">): LilyApplicationCommand.Option.Structure {
    return commandComponent(ApplicationCommandOptionType.BOOLEAN, props);
}

export function UserOption(props: Omit<LilyApplicationCommand.Option.Base, "type">): LilyApplicationCommand.Option.Structure {
    return commandComponent(ApplicationCommandOptionType.USER, props);
}

export function ChannelOption(props: Omit<LilyApplicationCommand.Option.Base, "type">): LilyApplicationCommand.Option.Structure {
    return commandComponent(ApplicationCommandOptionType.CHANNEL, props);
}

export function RoleOption(props: Omit<LilyApplicationCommand.Option.Base, "type">): LilyApplicationCommand.Option.Structure {
    return commandComponent(ApplicationCommandOptionType.ROLE, props);
}

export function MentionableOption(props: Omit<LilyApplicationCommand.Option.Base, "type">): LilyApplicationCommand.Option.Structure {
    return commandComponent(ApplicationCommandOptionType.MENTIONABLE, props);
}

export function NumberOption(props: CommandWithChildren<NumericCommandOption>
    | LilyApplicationCommand.Option.WithAutocomplete<LilyApplicationCommand.Option.NumericStructure>): LilyApplicationCommand.Option.Structure {
    //@ts-expect-error The type does exist
    let { children: choices, ...obj } = props;
    if (choices != null && !Array.isArray(choices)) choices = [choices];

    return commandComponent(ApplicationCommandOptionType.NUMBER, { ...obj, choices });
}

export function AttachmentOption(props: Omit<LilyApplicationCommand.Option.Base, "type">): LilyApplicationCommand.Option.Structure {
    return commandComponent(ApplicationCommandOptionType.ATTACHMENT, props);
}
