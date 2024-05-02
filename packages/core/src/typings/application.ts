import type { DiscordImageData } from "./image-data.js";
import type { Localizations } from "./localizations.js";
import type { OAuthScopes } from "./oauth2.js";
import type { Guild } from "./guild.js";
import type { Team } from "./team.js";
import type { User } from "./user.js";

import type {
    ApplicationRoleConnectionMetadataType,
    ApplicationIntegrationType,
    ApplicationFlags,
    PermissionFlags
} from "#enums";

export declare namespace Application {

    /**
     * @see {@link https://discord.com/developers/docs/resources/application#application-object-application-structure}
     */
    export interface Structure {
        id: string;
        name: string;
        icon: string | null;
        description: string;
        rpc_origins?: Array<string>;
        bot_public: boolean;
        bot_require_code_grant: boolean;
        bot?: Partial<User.Structure>;
        terms_of_service_url?: string;
        privacy_policy_url?: string;
        owner?: Partial<User.Structure>;
        verify_key: string;
        team: Team.Structure | null;
        guild_id?: string;
        guild?: Partial<Guild.Structure>;
        primary_sku_id?: string;
        slug?: string;
        cover_image?: string;
        /**
         * Bitfield of {@link ApplicationFlags}
         */
        flags?: number;
        approximate_guild_count?: number;
        redirect_uris?: Array<string>;
        interactions_endpoint_url?: string;
        role_connections_verification_url?: string;
        tags?: Array<string>;
        install_params?: InstallParamsStructure;
        integration_types_config?: Record<ApplicationIntegrationType, { oauth2_install_params?: InstallParamsStructure }>;
        custom_install_url?: string;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/application#install-params-object-install-params-structure}
     */
    export interface InstallParamsStructure {
        scopes: Array<OAuthScopes>;
        /**
         * Bitfield of {@link PermissionFlags}
         */
        permissions: string;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/application#edit-current-application-json-params}
     */
    export interface EditApplicationJSONParams {
        custom_install_url?: string;
        description?: string;
        role_connections_verification_url?: string;
        install_params?: InstallParamsStructure;
        integration_types_config?: Record<ApplicationIntegrationType, { oauth2_install_params?: InstallParamsStructure }>;
        /**
         * Bitfield of {@link ApplicationFlags}
         */
        flags?: number;
        icon?: DiscordImageData;
        cover_image?: DiscordImageData;
        interactions_endpoint_url?: string;
        tags?: Array<string>;
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/application-role-connection-metadata#application-role-connection-metadata-object-application-role-connection-metadata-structure}
     */
    export interface RoleConnectionMetadataStructure extends Localizations.Base {
        type: ApplicationRoleConnectionMetadataType;
        key: string;
        name: string;
        description: string;
    }

}
