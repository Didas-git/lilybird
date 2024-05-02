import type { User } from "./user.js";

export declare namespace Emoji {
    /**
     * @see {@link https://discord.com/developers/docs/resources/emoji#emoji-object-emoji-structure}
     */
    export interface Structure {
        id: string | null;
        name: string | null;
        roles?: Array<string>;
        user?: User.Structure;
        require_colons?: boolean;
        managed?: boolean;
        animated?: boolean;
        available?: boolean;
    }
}
