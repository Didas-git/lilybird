import type { ApplicationCommandPermissionType } from "../../enums/index.js";

export interface GuildApplicationCommandPermissionsStructure {
    id: string;
    application_id: string;
    guild_id: string;
    permissions: Array<ApplicationCommandPermissionsStructure>;
}

export interface ApplicationCommandPermissionsStructure {
    id: string;
    type: ApplicationCommandPermissionType;
    permission: boolean;
}
