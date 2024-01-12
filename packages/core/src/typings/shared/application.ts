import type { OAuthScopes } from "../gateway/oauth2.js";

export interface InstallParamsStructure {
    scopes: Array<OAuthScopes>;
    permissions: string;
}
