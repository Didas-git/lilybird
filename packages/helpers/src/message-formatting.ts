export function formatUser(userId: string): string {
    return `<@${userId}>`;
}

export function formatChannel(channelId: string): string {
    return `<#${channelId}>`;
}

export function formatRole(roleId: string): string {
    return `<@&${roleId}>`;
}

export function formatChatInputCommand(commandId: string, commandName: string, subCommandName?: string, subCommandGroupName?: string): string {
    let str = commandName;
    if (typeof subCommandGroupName !== "undefined") {
        if (typeof subCommandName === "undefined") throw new Error("Invalid sub command group");
        str += ` ${subCommandGroupName} ${subCommandName}`;
    } else if (typeof subCommandName !== "undefined") str += ` ${subCommandName}`;

    return `</${str}:${commandId}>`;
}

export function formatCustomEmoji(name: string, id: string, animated: boolean = false): string {
    return `<${animated ? "a" : ""}:${name}:${id}>`;
}

/**
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-timestamp-styles}
 */
export const enum TimestampStyle {
    ShortTime = "t",
    LongTime = "T",
    ShortDate = "d",
    LongDate = "D",
    /**
     * @default
     */
    ShortDateTime = "f",
    LongDateTime = "F",
    RelativeTime = "R"

}

export function formatTimestamp(timestamp: string | Date | number, style: TimestampStyle = TimestampStyle.ShortDateTime): string {
    const tm: string = timestamp instanceof Date ? Math.trunc(timestamp.getTime() / 1000).toString() : timestamp.toString();
    return `<t:${tm}:${style}>`;
}

/**
 * @see {@link https://discord.com/developers/docs/reference#message-formatting-guild-navigation-types}
 */
export const enum GuildNavigationType {
    Customize = "customize",
    Browse = "browse",
    Guide = "guide",
    LinkedRoles = "linked-roles"
}

export function formatGuildNavigation(type: GuildNavigationType): string;
export function formatGuildNavigation(type: GuildNavigationType.LinkedRoles, roleId?: string): string;
export function formatGuildNavigation(type: GuildNavigationType, roleId?: string): string {
  if (type == GuildNavigationType.LinkedRoles && typeof roleId !== "undefined")
    return `<id:${type}:${roleId}`;

  return `<id:${type}>`;
}
