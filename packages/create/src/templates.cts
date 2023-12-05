/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @stylistic/multiline-ternary */
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const { name, version } = require("../package.json") as { name: string, version: string };

export function generateREADME(pm: string, type: string): string {
    return `# Welcome to Lilybird

## Getting Started

To run your bot you can run:

\`\`\`sh
${pm} run ${type === "ts" ? pm === "bun" ? "start" : "dev" : "start"}
\`\`\`
${type === "ts" ? pm === "bun" ? "" : `You can build the project with:

\`\`\`sh
${pm} run build
\`\`\`

` : ""}
> Generated with ${name} ${version}.
`;
}

export function generateTSConfig(type: string, pm: string): string {
    const temp: Record<string, any> = {
        compilerOptions: {
            outDir: "dist",
            baseUrl: "."
        },
        include: ["src/**/*"]
    };

    if (pm === "bun") temp.compilerOptions.types = ["bun-types"];
    if (type === "lilybird") temp.extends = "lilybird/tsconfig.json";
    else temp.compilerOptions.strict = true;

    return JSON.stringify(temp, null, 4);
}
