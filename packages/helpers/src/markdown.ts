export function italic(text: string): string {
    return `_${text}_`;
}

export function bold(text: string): string {
    return `**${text}**`;
}

export function boldItalic(text: string): string {
    return `***${text}***`;
}

export function underline(text: string): string {
    return `__${text}__`;
}

export function strikeThrough(text: string): string {
    return `~~${text}~~`;
}

export function spoiler(text: string): string {
    return `||${text}||`;
}

export function subText(text: string): string {
    return `-# ${text}`;
}

export function quote(text: string, multiline: boolean = false): string {
    return multiline ? `>>> ${text}` : `> ${text}`;
}

export function header(text: string, level: number = 1): string {
    if (level < 1 || level > 3) throw new Error("Heading level has to be between '1' and '3' (inclusive)");
    return `${"#".repeat(level)} ${text}`;
}

export function maskedURL(text: string, url: string): string {
    return `[${text}](${url})`;
}

export type ListElements = Array<string | ListElements>;

export function unorderedList(elements: ListElements, depth: number = 0): string {
    let str = "";

    for (let i = 0, { length } = elements; i < length; i++) {
        const element = elements[i];
        if (Array.isArray(element)) {
            str += unorderedList(element, depth + 2);
            continue;
        }

        str += `${" ".repeat(depth)}- ${element}\n`;
    }

    return str;
}

export function block(text: string): string {
    return `\`${text}\``;
}

export function codeBlock(text: string, language: string = ""): string {
    return `\`\`\`${language}
${text}
\`\`\``;
}

export function parseCodeBlock(text: string): { language: string | null, body: string } {
    let blockStart = text.indexOf("```");
    if (blockStart === -1) throw new Error("No code block found in the message");

    blockStart += 3;
    const blockBreak = text.indexOf("\n", blockStart);
    const language = text.slice(blockStart, blockBreak);
    const blockEnd = text.indexOf("```", blockBreak);
    if (blockEnd === -1) throw new Error("Invalid code block. Block lacks the closing ticks");

    return { language: language.length > 0 ? language : null, body: text.slice(blockBreak + 1, blockEnd) };
}

export function suppressLinkEmbed(url: string): string {
    return `<${url}>`;
}
