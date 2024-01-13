import type { UserStructure } from "../shared/user.js";

export interface EmojiStructure {
    id: string | null;
    name: string | null;
    roles?: Array<string>;
    user?: UserStructure;
    require_colons?: boolean;
    managed?: boolean;
    animated?: boolean;
    available?: boolean;
}
