import type { AllowedMentionType, OverwriteType } from "../../enums";

export interface AllowedMentionsStructure {
    parse: Array<AllowedMentionType>;
    roles: Array<string>;
    users: Array<string>;
    replied_user: boolean;
}

export interface OverwriteStructure {
    id: string;
    type: OverwriteType;
    allow: string;
    deny: string;
}
