import type { StickerFormatType, StickerType } from "#enums";
import type { User } from "./user.js";

export declare namespace Sticker {
    export interface Structure {
        id: string;
        pack_id?: string;
        name: string;
        description: string | null;
        tags: string;
        type: StickerType;
        format_type: StickerFormatType;
        available?: boolean;
        guild_id?: string;
        user?: User.Structure;
        sort_value?: number;
    }

    export interface ItemStructure {
        id: string;
        name: string;
        format_type: StickerFormatType;
    }

    export interface PackStructure {
        id: string;
        stickers: Array<Structure>;
        name: string;
        sku_id: string;
        cover_sticker_id?: string;
        description: string;
        banner_asset_id?: string;
    }

}
