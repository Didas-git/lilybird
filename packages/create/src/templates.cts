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
    const temp: {
        compilerOptions: {
            target: string,
            module: string,
            moduleResolution: string,
            outDir: string,
            baseUrl: string,
            strict: boolean,
            types: Array<string>
        },
        include: Array<string>
    } = {
        compilerOptions: {
            target: "ESNext",
            module: "Node16",
            moduleResolution: "Node16",
            outDir: "dist",
            baseUrl: ".",
            strict: type === "strict",
            types: ["./globals.d.ts"]
        },
        include: ["src/**/*"]
    };

    if (pm === "bun") temp.compilerOptions.types.push("bun-types");
    else temp.compilerOptions.types.push("@types/node");

    return JSON.stringify(temp, null, 4);
}

export function generateGlobalTypes(pm: string): string {
    return pm === "bun" ? `declare module "bun" {
    interface Env {
        TOKEN: string
    }
}`
        : `declare namespace NodeJS {
    interface ProcessEnv {
        TOKEN: string
    }
}`;
}
