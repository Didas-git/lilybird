export enum Colors {
    Red = 0xFF0000,
    Green = 0x00FF00,
    Blue = 0x0000FF,
    Yellow = 0xFFFF00,
    Purple = 0x800080,
    Violet = 0xEE82EE,
    Indigo = 0x4B0082,
    SpringGreen = 0x00FF7F,
    FernGreen = 0x4F7942,
    Crimson = 0xDC143C,
    Golden = 0xFFD700,
    Pink = 0xFFC0CB,
    LimeGreen = 0x32CD32,
    WaterBlue = 0x3399FF,
    WaterGreen = 0x3EB489,
    SkyBlue = 0x87CEEB,
    Mint = 0x98FF98,
    Orange = 0xFFA500,
    BananaYellow = 0xFFFACD,
    Peach = 0xFFDAB9,
    KiwiGreen = 0x8EE53F,
    BerryPurple = 0x990099,
    LemonYellow = 0xFFF44F,
    GrapePurple = 0x6F2DA8
}

export function parseHexToByte10(hex: string): number {
    if (!hex.startsWith("#")) hex = `#${hex}`;
    return Number(hex.replace("#", "0x"));
}

export function rgbToByte10(rgb: Array<number>): number {
    if (rgb.length === 3) return Number(`0x${((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1)}`);
    else if (rgb.length === 4) return Number(`0x${((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1)}`); // Because hex doesn't have opacity.
    throw new RangeError(`Invalid RGB/RGBA length. Expected: 3 or 4. Got: ${rgb.length}`);
}
