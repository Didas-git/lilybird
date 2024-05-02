import type { ButtonStyle, ChannelType, ComponentType, TextInputStyle } from "#enums";
import type { Emoji } from "./emoji.js";

export declare namespace Component {
    export type Structure = ActionRowStructure | ButtonStructure | SelectMenuStructure | TextInputStructure;

    export interface Base {
        type: ComponentType;
    }

    /**
     * @see {@link https://discord.com/developers/docs/interactions/message-components#action-rows}
     */
    export interface ActionRowStructure extends Base {
        type: ComponentType.ActionRow;
        components: Array<Structure>;
    }

    /**
     * @see {@link https://discord.com/developers/docs/interactions/message-components#button-object-button-structure}
     */
    export interface ButtonStructure extends Base {
        type: ComponentType.Button;
        style: ButtonStyle;
        label?: string;
        emoji?: Pick<Emoji.Structure, "name" | "id" | "animated">;
        custom_id?: string;
        url?: string;
        disabled?: boolean;
    }

    /**
     * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-menu-structure}
     */
    export interface SelectMenuStructure extends Base {
        type: ComponentType.StringSelect | ComponentType.UserSelect | ComponentType.RoleSelect | ComponentType.MentionableSelect | ComponentType.ChannelSelect;
        custom_id: string;
        options?: Array<SelectOptionStructure>;
        channel_types?: Array<ChannelType>;
        placeholder?: string;
        default_values?: Array<SelectDefaultValueStructure>;
        min_values?: number;
        max_values?: number;
        disabled?: boolean;
    }

    /**
     * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-option-structure}
     */
    export interface SelectOptionStructure {
        label: string;
        value: string;
        description?: string;
        emoji?: Pick<Emoji.Structure, "id" | "name" | "animated">;
        default?: boolean;
    }

    /**
     * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-default-value-structure}
     */
    export interface SelectDefaultValueStructure {
        id: string;
        type: "user" | "role" | "channel";
    }

    /**
     * @see {@link https://discord.com/developers/docs/interactions/message-components#text-input-object-text-input-structure}
     */
    export interface TextInputStructure {
        type: ComponentType.TextInput;
        custom_id: string;
        style: TextInputStyle;
        label: string;
        min_length?: number;
        max_length?: number;
        required?: boolean;
        value?: string;
        placeholder?: string;
    }
}
