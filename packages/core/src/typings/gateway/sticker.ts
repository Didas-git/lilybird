import type { StickerFormatType, StickerType } from "../../enums/index.js";
import type { UserStructure } from "./user.js";

export interface StickerStructure {
    id: string;
    pack_id?: string;
    name: string;
    description: string | null;
    tags: string;
    type: StickerType;
    format_type: StickerFormatType;
    available?: boolean;
    guild_id?: string;
    user?: UserStructure;
    sort_value?: number;
}

export interface StickerItemStructure {
    id: string;
    name: string;
    format_type: StickerFormatType;
}

export interface StickerPackStructure {
    id: string;
    stickers: Array<StickerStructure>;
    name: string;
    sku_id: string;
    cover_sticker_id?: string;
    description: string;
    banner_asset_id?: string;
}
