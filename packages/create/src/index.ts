#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import Enquirer from "enquirer";
import c from "ansi-colors";
//@ts-expect-error Enquirer moment
const { Input, Select, MultiSelect, Snippet } = Enquirer;

import { generateGlobalTypes, generateREADME, generateTSConfig } from "./templates.cjs";
import { stat, mkdir, readdir, writeFile, cp } from "node:fs/promises";
import { execSync } from "node:child_process";
import { resolve } from "node:path";
import { platform } from "node:os";

//#region Directory
const directory = await new Input({
    message: "What will the name of the directory be?"
}).run() as string;

const root = resolve(directory);

const directoryStats = await stat(root).catch(async (error) => {
    if (error.code === "ENOENT") {
        await mkdir(root, { recursive: true });
        return stat(root);
    }

    throw error;
});

if (!directoryStats.isDirectory()) {
    console.error(c.red("The given path is not a directory"));
    process.exit(1);
}

if ((await readdir(root)).length > 0) {
    console.error(c.red("The given directory is not empty"));
    process.exit(1);
}
//#endregion Directory

const pm = await new Select({
    message: "What package manager would you like to use?",
    choices: [
        { name: "Bun", value: "bun" },
        { name: "PNPM", value: "pnpm" },
        { name: "NPM", value: "npm" },
        { name: "YARN", value: "yarn" }
    ],
    result(name: string) {
        return this.find(name).value as string;
    }
}).run() as string;

const type = await new Select({
    message: "What language will you be using?",
    choices: [
        { name: "Javascript", value: "js" },
        { name: "Typescript", value: "ts" }
    ],
    result(name: string) {
        return this.find(name).value as string;
    }
}).run() as string;

let config: null | "strict" | "normal" = null;
const devDeps: Array<string> = [];

if (type === "ts") {
    devDeps.push("typescript");
    config = await new Select({
        message: "What typescript config style would you like to use?",
        choices: [
            { name: "Non-strict", value: "normal" },
            { name: "Strict", value: "strict" },
            { name: "None", value: null }
        ],
        result(name: string) {
            return this.find(name).value as "strict" | "normal" | null;
        }
    }).run() as "strict" | "normal" | null;
}

const packages = await new MultiSelect({
    message: "Choose what packages you would like to install",
    choices: [
        {
            name: "@lilybird/jsx",
            value: "jsx"
        },
        {
            name: "@lilybird/handlers",
            value: "handlers"
        },
        {
            name: "@lilybird/helpers",
            value: "helpers"
        }
    ]
}).run() as Array<string>;

if (!packages.includes("@lilybird/handlers")) {
    const installTransformers = await new Select({
        message: "Would you like to install the default transformers?",
        choices: [
            { name: "YES", value: true },
            { name: "NO", value: false }
        ],
        result(name: string) {
            return this.find(name).value as boolean;
        }
    }).run() as boolean;

    if (installTransformers) packages.push("@lilybird/transformers");
} else {
    // We want to install the transformers together with the handlers for DX purposes.
    // The users can easily import the types this way.
    packages.push("@lilybird/transformers");
}

let dependencies: Array<string> = packages.concat("lilybird");

// eslint-disable-next-line @typescript-eslint/naming-convention
const packageJSON = (await new Snippet({
    message: "Fill out your package.json",
    required: true,
    template: `{
  "name": "\${name}",
  "description": "\${description}",
  "version": "\${version}",
  "type": "module",
  "main": ${pm === "bun" ? `"./src/index.${type}"` : '"./dist/index.js"'},
  "scripts": {
    ${pm === "bun"
        ? '"start": "bun ."'
        : type === "ts"
            ? `"dev": "ts-node --env-file=.env ./src/index.ts",\n    "build": "${platform() === "win32" ? "rmdir /s /q dist" : "rm -rf dist"} && tsc",\n    "start": "node --env-file=.env ."`
            : "\"start\": \"node .\""}
  }
}`
}).run()).result as string;

process.chdir(root);

await writeFile("package.json", packageJSON);
await writeFile("README.md", generateREADME(pm, type));
await writeFile(".env", "TOKEN=");

if (type === "ts") await writeFile("globals.d.ts", generateGlobalTypes(pm));
if (config !== null) await writeFile("tsconfig.json", generateTSConfig(config, pm));

await mkdir("src");
process.chdir(resolve("src"));

if (dependencies.includes("@lilybird/handlers")) {
    await cp(new URL("./templates/handlers-template.ts", import.meta.url), `./index.${type}`);
    await mkdir("listeners");
    process.chdir(resolve("listeners"));
    await cp(new URL(`./templates/listener-template.${type}`, import.meta.url), `./ready.${type}`);
} else if (dependencies.includes("@lilybird/transformers")) await cp(new URL("./templates/transformers-template.ts", import.meta.url), `./index.${type}`);
else await cp(new URL("./templates/basic-template.ts", import.meta.url), `./index.${type}`);

process.chdir(root);

if (process.argv.at(-1) === "--alpha") dependencies = dependencies.map((dep) => `${dep}@alpha`);

execSync(`${pm} install ${dependencies.join(" ")}`, {
    stdio: "inherit"
});

if (pm === "bun") devDeps.push("bun-types");
else devDeps.push("ts-node", "@types/node");

execSync(`${pm} install -D ${devDeps.join(" ")}`, {
    stdio: "inherit"
});

console.log(c.green("All done!"));
