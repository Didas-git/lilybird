import { ImageFormat } from "../index.js";
import type { CDNOptions, ImageSize } from "../typings/image.js";

const CDNURL = "https://cdn.discordapp.com/";

function getFormat(hash: string, format?: ImageFormat, allowsGIF: boolean = true): ImageFormat {
    if (!allowsGIF && format === ImageFormat.GIF) throw new Error("Invalid image format");
    if (typeof format !== "undefined") return format;
    if (hash.startsWith("a_")) return ImageFormat.GIF;
    return ImageFormat.JPEG;
}

function getSize(size?: ImageSize): string {
    if (typeof size === "undefined") return "";
    return `?size=${size}`;
}

export function customEmojiURL(emojiId: string, options?: CDNOptions): string {
    return `${CDNURL}emojis/${emojiId}${getFormat(emojiId, options?.format)}${getSize(options?.size)}`;
}

export function guildIconURL(guildId: string, guildIcon: string, options?: CDNOptions): string {
    return `${CDNURL}icons/${guildId}/${guildIcon}${getFormat(guildIcon, options?.format)}${getSize(options?.size)}`;
}

export function guildSplashURL(guildId: string, guildSplash: string, options?: CDNOptions): string {
    return `${CDNURL}splashes/${guildId}/${guildSplash}${getFormat(guildSplash, options?.format, false)}${getSize(options?.size)}`;
}

export function guildDiscoverySplashURL(guildId: string, guildDiscoverySplash: string, options?: CDNOptions): string {
    return `${CDNURL}discovery-splashes/${guildId}/${guildDiscoverySplash}${getFormat(guildDiscoverySplash, options?.format, false)}${getSize(options?.size)}`;
}

export function guildBannerURL(guildId: string, guildBanner: string, options?: CDNOptions): string {
    return `${CDNURL}banners/${guildId}/${guildBanner}${getFormat(guildBanner, options?.format)}${getSize(options?.size)}`;
}

export function userBannerURL(userId: string, userBanner: string, options?: CDNOptions): string {
    return `${CDNURL}banners/${userId}/${userBanner}${getFormat(userBanner, options?.format)}${getSize(options?.size)}`;
}

export function defaultUserAvatarURL(index: string, options?: CDNOptions): string {
    return `${CDNURL}embed/avatars/${index}${ImageFormat.PNG}${getSize(options?.size)}`;
}

export function userAvatarURL(userId: string, userAvatar: string, options?: CDNOptions): string {
    return `${CDNURL}avatars/${userId}/${userAvatar}${getFormat(userAvatar, options?.format)}${getSize(options?.size)}`;
}

export function guildMemberAvatarURL(guildId: string, userId: string, memberAvatar: string, options?: CDNOptions): string {
    return `${CDNURL}guilds/${guildId}/users/${userId}/avatars/${memberAvatar}${getFormat(memberAvatar, options?.format)}${getSize(options?.size)}`;
}

export function userAvatarDecorationURL(userId: string, userAvatarDecoration: string, options?: CDNOptions): string {
    return `${CDNURL}avatar-decorations/${userId}/${userAvatarDecoration}${ImageFormat.PNG}${getSize(options?.size)}`;
}

export function applicationIconURL(applicationId: string, icon: string, options?: CDNOptions): string {
    return `${CDNURL}app-icons/${applicationId}/${icon}${getFormat(icon, options?.format, false)}${getSize(options?.size)}`;
}

export function applicationCoverURL(applicationId: string, cover: string, options?: CDNOptions): string {
    return `${CDNURL}app-icons/${applicationId}/${cover}${getFormat(cover, options?.format, false)}${getSize(options?.size)}`;
}

export function applicationAssetURL(applicationId: string, assetId: string, options?: CDNOptions): string {
    return `${CDNURL}app-assets/${applicationId}/${assetId}${getFormat(assetId, options?.format, false)}${getSize(options?.size)}`;
}

export function achievementIconURL(applicationId: string, achievementId: string, icon: string, options?: CDNOptions): string {
    return `${CDNURL}app-assets/${applicationId}/achievements/${achievementId}/icons/${icon}${getFormat(icon, options?.format, false)}${getSize(options?.size)}`;
}

export function storePageAssetURL(applicationId: string, assetId: string, options?: CDNOptions): string {
    return `${CDNURL}app-assets/${applicationId}/store/${assetId}${getFormat(assetId, options?.format, false)}${getSize(options?.size)}`;
}

export function stickerPackBannerURL(applicationId: string, stickerPackBannerAssetId: string, options?: CDNOptions): string {
    return `${CDNURL}app-assets/${applicationId}/store/${stickerPackBannerAssetId}${getFormat(stickerPackBannerAssetId, options?.format, false)}${getSize(options?.size)}`;
}

export function teamIconURL(teamId: string, teamIcon: string, options?: CDNOptions): string {
    return `${CDNURL}team-icons/${teamId}/${teamIcon}${getFormat(teamIcon, options?.format, false)}${getSize(options?.size)}`;
}

export function stickerURL(stickerId: string, options?: CDNOptions): string {
    return `${CDNURL}sticker/${stickerId}${getFormat(stickerId, options?.format)}${getSize(options?.size)}`;
}

export function roleIconURL(roleId: string, roleIcon: string, options?: CDNOptions): string {
    return `${CDNURL}role-icons/${roleId}/${roleIcon}${getFormat(roleIcon, options?.format, false)}${getSize(options?.size)}`;
}

export function guildScheduledEventCoverURL(eventId: string, eventCover: string, options?: CDNOptions): string {
    return `${CDNURL}guild-events/${eventId}/${eventCover}${getFormat(eventCover, options?.format, false)}${getSize(options?.size)}`;
}

export function guildMemberBannerURL(guildId: string, userId: string, memberBanner: string, options?: CDNOptions): string {
    return `${CDNURL}guilds/${guildId}/users/${userId}/banners/${memberBanner}${getFormat(memberBanner, options?.format)}${getSize(options?.size)}`;
}
