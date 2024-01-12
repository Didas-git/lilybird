import type { InstallParamsStructure } from "../shared/index.js";
import type { ImageData } from "../image-data.js";

export interface PATCHCurrentApplication {
    custom_install_url?: string;
    description?: string;
    role_connections_verification_url?: string;
    install_params?: InstallParamsStructure;
    flags?: number;
    icon?: ImageData;
    cover_image?: ImageData;
    interactions_endpoint_url?: string;
    tags?: Array<string>;
}
