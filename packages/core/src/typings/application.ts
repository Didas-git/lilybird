import type { ApplicationFlags } from "../enums/index.js";

import type { GuildStructure, UserStructure, OAuthScopes, Team } from "./index.js";

export interface ApplicationStructure {
    id: string;
    name: string;
    icon: string | null;
    description: string;
    rpc_origins?: Array<string>;
    bot_public: boolean;
    bot_require_code_grant: boolean;
    terms_of_service_url?: string;
    privacy_policy_url?: string;
    owner?: Partial<UserStructure>;
    verify_key: string;
    team: Team | null;
    guild_id?: string;
    guild?: Partial<GuildStructure>;
    primary_sku_id?: string;
    slug?: string;
    cover_image?: string;
    flags?: ApplicationFlags;
    approximate_guild_count?: number;
    role_connections_verification_url?: string;
    tags?: Array<string>;
    install_params?: InstallParamsStructure;
    custom_install_url?: string;
}

export interface InstallParamsStructure {
    scopes: Array<OAuthScopes>;
    permissions: string;
}
