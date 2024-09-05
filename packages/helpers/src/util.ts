export function hexColorToNumber(color: string): number {
    return parseInt(color.replace("#", ""), 16);
}
