export function closeCodeAllowsReconnection(code: number): boolean {
    return code >= 4000 && code !== 4004 && code < 4010;
}
