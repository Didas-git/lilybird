/* eslint-disable @typescript-eslint/naming-convention */
import { ComponentType } from "lilybird";

import type {
    ChannelType,
    ButtonStyle,
    Message,
    Emoji
} from "lilybird";

export function ActionRow({
    children
}: {
    children: Array<Exclude<Message.Component.Structure, Message.Component.ActionRowStructure>> | Exclude<Message.Component.Structure, Message.Component.ActionRowStructure>
}): Message.Component.ActionRowStructure {
    if (!Array.isArray(children))children = [children];

    return {
        type: ComponentType.ActionRow,
        components: children
    };
}

export function Button(props: {
    id: string,
    style: Exclude<ButtonStyle, ButtonStyle.Link>,
    label?: string,
    emoji?: Pick<Emoji.Structure, "name" | "id" | "animated">,
    disabled?: boolean
} | {
    url: string,
    style: ButtonStyle.Link,
    label?: string,
    emoji?: Pick<Emoji.Structure, "name" | "id" | "animated">,
    disabled?: boolean
}): Message.Component.ButtonStructure {
    const base: Message.Component.ButtonStructure = {
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
}: Omit<Message.Component.TextInputStructure, "custom_id" | "type"> & {
    id: string
}): Message.Component.TextInputStructure {
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
    children: Array<Message.Component.SelectOptionStructure> | Message.Component.SelectOptionStructure
}): Message.Component.StringSelectStructure {
    if (!Array.isArray(children)) children = [children];

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
    children?: Array<Message.Component.SelectDefaultValueStructure> | Message.Component.SelectDefaultValueStructure
}): Message.Component.UserSelectStructure {
    if (children != null && !Array.isArray(children)) children = [children];

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
    children?: Array<Message.Component.SelectDefaultValueStructure> | Message.Component.SelectDefaultValueStructure
}): Message.Component.RoleSelectStructure {
    if (children != null && !Array.isArray(children))
        children = [children];

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
    children?: Array<Message.Component.SelectDefaultValueStructure> | Message.Component.SelectDefaultValueStructure
}): Message.Component.MentionableSelectStructure {
    if (children != null && !Array.isArray(children)) children = [children];

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
    children?: Array<Message.Component.SelectDefaultValueStructure> | Message.Component.SelectDefaultValueStructure
}): Message.Component.ChannelSelectStructure {
    if (children != null && !Array.isArray(children)) children = [children];

    return {
        type: ComponentType.ChannelSelect,
        custom_id: id,
        placeholder,
        min_values,
        max_values,
        disabled,
        channel_types,
        default_values: children
    };
}
