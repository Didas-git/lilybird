import type { ButtonStyle, ChannelType, ComponentType, TextInputStyle } from "#enums";
import type { Emoji } from "./emoji.js";

export declare namespace Component {
    export type Structure = ActionRowStructure
        | ButtonStructure
        | StringSelectStructure
        | TextInputStructure
        | UserSelectStructure
        | RoleSelectStructure
        | MentionableSelectStructure
        | ChannelSelectStructure
        | SectionStructure
        | TextDisplayStructure
        | ThumbnailStructure
        | MediaGalleryStructure
        | FileStructure
        | SeparatorStructure
        | ContainerStructure;

    /**
     * @see {@link https://discord.com/developers/docs/components/reference#anatomy-of-a-component}
     */
    export interface Base {
        type: ComponentType;
        id?: number;
    }

    /**
     * @see {@link https://discord.com/developers/docs/components/reference#action-row}
     */
    export interface ActionRowStructure extends Base {
        type: ComponentType.ActionRow;
        components: Array<Structure>;
    }

    /**
     * @see {@link https://discord.com/developers/docs/components/reference#button}
     */
    export interface ButtonStructure extends Base {
        type: ComponentType.Button;
        style: ButtonStyle;
        label?: string;
        emoji?: Pick<Emoji.Structure, "name" | "id" | "animated">;
        custom_id?: string;
        sku_id?: string;
        url?: string;
        disabled?: boolean;
    }

    /**
     * @see {@link https://discord.com/developers/docs/components/reference#string-select}
     */
    export interface StringSelectStructure extends Base {
        type: ComponentType.StringSelect;
        custom_id: string;
        options?: Array<SelectOptionStructure>;
        placeholder?: string;
        min_values?: number;
        max_values?: number;
        disabled?: boolean;
    }

    /**
     * @see {@link https://discord.com/developers/docs/components/reference#string-select-select-option-structure}
     */
    export interface SelectOptionStructure {
        label: string;
        value: string;
        description?: string;
        emoji?: Pick<Emoji.Structure, "id" | "name" | "animated">;
        default?: boolean;
    }

    /**
     * @see {@link https://discord.com/developers/docs/components/reference#text-input}
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

    /**
     * @see {@link https://discord.com/developers/docs/components/reference#user-select}
     */
    export interface UserSelectStructure extends Base {
        type: ComponentType.UserSelect;
        custom_id: string;
        placeholder?: string;
        default_values?: Array<SelectDefaultValueStructure>;
        min_values?: number;
        max_values?: number;
        disabled?: boolean;
    }

    /**
     * @see {@link https://discord.com/developers/docs/components/reference#user-select-select-default-value-structure}
     */
    export interface SelectDefaultValueStructure {
        id: string;
        type: "user" | "role" | "channel";
    }

    /**
     * @see {@link https://discord.com/developers/docs/components/reference#role-select}
     */
    export interface RoleSelectStructure extends Base {
        type: ComponentType.RoleSelect;
        custom_id: string;
        placeholder?: string;
        default_values?: Array<SelectDefaultValueStructure>;
        min_values?: number;
        max_values?: number;
        disabled?: boolean;
    }

    /**
     * @see {@link https://discord.com/developers/docs/components/reference#mentionable-select}
     */
    export interface MentionableSelectStructure extends Base {
        type: ComponentType.MentionableSelect;
        custom_id: string;
        placeholder?: string;
        default_values?: Array<SelectDefaultValueStructure>;
        min_values?: number;
        max_values?: number;
        disabled?: boolean;
    }

    /**
     * @see {@link https://discord.com/developers/docs/components/reference#channel-select}
     */
    export interface ChannelSelectStructure extends Base {
        type: ComponentType.ChannelSelect;
        custom_id: string;
        channel_types?: Array<ChannelType>;
        placeholder?: string;
        default_values?: Array<SelectDefaultValueStructure>;
        min_values?: number;
        max_values?: number;
        disabled?: boolean;
    }

    /**
     * @see {@link https://discord.com/developers/docs/components/reference#section}
     */
    export interface SectionStructure extends Base {
        type: ComponentType.Section;
        components: Array<TextDisplayStructure>;
        accessory: ThumbnailStructure | ButtonStructure;
    }

    /**
     * @see {@link https://discord.com/developers/docs/components/reference#text-display}
     */
    export interface TextDisplayStructure extends Base {
        type: ComponentType.TextDisplay;
        content: string;
    }

    /**
     * @see {@link https://discord.com/developers/docs/components/reference#thumbnail}
     */
    export interface ThumbnailStructure extends Base {
        type: ComponentType.Thumbnail;
        media: UnfurledMediaItemStructure;
        description?: string;
        spoiler?: boolean;
    }

    /**
     * @see {@link https://discord.com/developers/docs/components/reference#unfurled-media-item-structure}
     */
    export interface UnfurledMediaItemStructure {
        url: string;
        proxy_url?: string;
        height?: number | null;
        width?: number | null;
        content_type?: string;
    }

    /**
     * @see {@link https://discord.com/developers/docs/components/reference#media-gallery}
     */
    export interface MediaGalleryStructure extends Base {
        type: ComponentType.MediaGallery;
        items: Array<MediaGalleryItemStructure>;
    }

    /**
     * @see {@link https://discord.com/developers/docs/components/reference#media-gallery-media-gallery-item-structure}
     */
    export interface MediaGalleryItemStructure extends Base {
        media: UnfurledMediaItemStructure;
        description?: string;
        spoiler?: boolean;
    }

    /**
     * @see {@link https://discord.com/developers/docs/components/reference#file}
     */
    export interface FileStructure extends Base {
        type: ComponentType.File;
        file: UnfurledMediaItemStructure;
        spoiler?: boolean;
    }

    /**
     * @see {@link https://discord.com/developers/docs/components/reference#separator}
     */
    export interface SeparatorStructure extends Base {
        type: ComponentType.Separator;
        divider?: boolean;
        spacing?: number;
    }

    /**
     * @see {@link https://discord.com/developers/docs/components/reference#container}
     */
    export interface ContainerStructure extends Base {
        type: ComponentType.Container;
        components: Array<ActionRowStructure | TextDisplayStructure | SectionStructure | MediaGalleryStructure | SeparatorStructure | FileStructure>;
        accent_color?: number | null;
        spoiler?: boolean;
    }
}
