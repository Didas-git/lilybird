/* eslint-disable @typescript-eslint/naming-convention */
import { type ButtonStyle, ComponentType, type ChannelType } from "../enums";

import type {
    SelectDefaultValueStructure,
    MessageComponentStructure,
    SelectOptionStructure,
    SelectMenuStructure,
    ActionRowStructure,
    TextInputStructure,
    ButtonStructure,
    EmojiStructure
} from "../typings";

export function ActionRow({
    children
}: {
    children: Array<Exclude<MessageComponentStructure, ActionRowStructure>> | Exclude<MessageComponentStructure, ActionRowStructure>
}): ActionRowStructure {
    !Array.isArray(children) && (children = [children]);
    return {
        type: ComponentType.ActionRow,
        components: children
    };
}

export function Button(props: {
    id: string,
    style: Exclude<ButtonStyle, ButtonStyle.Link>,
    label?: string,
    emoji?: Pick<EmojiStructure, "name" | "id" | "animated">,
    disabled?: boolean
} | {
    url: string,
    style: ButtonStyle.Link,
    label?: string,
    emoji?: Pick<EmojiStructure, "name" | "id" | "animated">,
    disabled?: boolean
}): ButtonStructure {
    const base: ButtonStructure = {
        type: ComponentType.Button,
        style: props.style,
        label: props.label,
        emoji: props.emoji,
        disabled: props.disabled
    };

    if ("url" in props) {
        base.url = props.url;
        return base;
    }

    base.custom_id = props.id;
    return base;
}

export function TextInputModal({
    id,
    style,
    label,
    min_length,
    max_length,
    required,
    value,
    placeholder
}: Omit<TextInputStructure, "custom_id" | "type"> & {
    id: string
}): TextInputStructure {
    return {
        type: ComponentType.TextInput,
        custom_id: id,
        style,
        label,
        min_length,
        max_length,
        required,
        value,
        placeholder
    };
}

interface BaseSelectMenuOptions {
    id: string;
    placeholder?: string;
    min_values?: number;
    max_values?: number;
    disabled?: boolean;
}

export function StringSelectMenu({
    id,
    placeholder,
    min_values,
    max_values,
    disabled,
    children
}: BaseSelectMenuOptions & {
    children: Array<SelectOptionStructure> | SelectOptionStructure
}): SelectMenuStructure {
    !Array.isArray(children) && (children = [children]);
    return {
        type: ComponentType.StringSelect,
        custom_id: id,
        placeholder,
        min_values,
        max_values,
        disabled,
        options: children
    };
}

export function UserSelectMenu({
    id,
    placeholder,
    min_values,
    max_values,
    disabled,
    children
}: BaseSelectMenuOptions & {
    children?: Array<SelectDefaultValueStructure> | SelectDefaultValueStructure
}): SelectMenuStructure {
    children != null && !Array.isArray(children) && (children = [children]);
    return {
        type: ComponentType.UserSelect,
        custom_id: id,
        placeholder,
        min_values,
        max_values,
        disabled,
        default_values: children
    };
}

export function RoleSelectMenu({
    id,
    placeholder,
    min_values,
    max_values,
    disabled,
    children
}: BaseSelectMenuOptions & {
    children?: Array<SelectDefaultValueStructure> | SelectDefaultValueStructure
}): SelectMenuStructure {
    children != null && !Array.isArray(children) && (children = [children]);
    return {
        type: ComponentType.RoleSelect,
        custom_id: id,
        placeholder,
        min_values,
        max_values,
        disabled,
        default_values: children
    };
}

export function MentionableSelectMenu({
    id,
    placeholder,
    min_values,
    max_values,
    disabled,
    children
}: BaseSelectMenuOptions & {
    children?: Array<SelectDefaultValueStructure> | SelectDefaultValueStructure
}): SelectMenuStructure {
    children != null && !Array.isArray(children) && (children = [children]);
    return {
        type: ComponentType.MentionableSelect,
        custom_id: id,
        placeholder,
        min_values,
        max_values,
        disabled,
        default_values: children
    };
}

export function ChannelSelectMenu({
    id,
    placeholder,
    min_values,
    max_values,
    channel_types,
    disabled,
    children
}: BaseSelectMenuOptions & {
    channel_types?: Array<ChannelType>,
    children?: Array<SelectDefaultValueStructure> | SelectDefaultValueStructure
}): SelectMenuStructure {
    children != null && !Array.isArray(children) && (children = [children]);
    return {
        type: ComponentType.RoleSelect,
        custom_id: id,
        placeholder,
        min_values,
        max_values,
        disabled,
        channel_types,
        default_values: children
    };
}