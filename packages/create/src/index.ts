#!/usr/bin/env node

import Enquirer from "enquirer";
import c from "ansi-colors";
//@ts-expect-error Enquirer moment
const { Input, Select, MultiSelect, Snippet } = Enquirer;

import { resolve } from "node:path";
import { stat, mkdir, readdir, writeFile, cp } from "node:fs/promises";
import { execSync } from "node:child_process";
import { platform } from "node:os"
import { generateGlobalTypes, generateREADME, generateTSConfig } from "./templates.cjs";

//#region Directory 
const directory = await new Input({
    message: "What will the name of the directory be?"
}).run();

const root = resolve(directory);

const directoryStats = await stat(root).catch(async (error) => {
    if (error.code === 'ENOENT') {
        await mkdir(root, { recursive: true });
        return stat(root);
    }

    throw error;
});

if (!directoryStats.isDirectory()) {
    console.error(c.red("The given path is not a directory"))
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
        return this.find(name).value;
    }
}).run();

const type = await new Select({
    message: "What language will you be using?",
    choices: [
        { name: "Javascript", value: "js" },
        { name: "Typescript", value: "ts" }
    ],
    result(name: string) {
        return this.find(name).value;
    }
}).run();

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
            return this.find(name).value;
        }
    }).run();
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
        }
        // {
        //     name: "@lilybird/builders",
        //     value: "builders",
        // }
    ]
}).run();

const dependencies: Array<string> = packages.concat("lilybird")

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
    ${pm === "bun" ? '"start": "bun ."' : type === "ts" ? `"dev": "ts-node --env-file=.env ./src/index.ts",\n    "build": "${platform() === "win32" ? "rmdir /s /q dist" : "rm -rf dist"} && tsc",\n    "start": "node --env-file=.env ."` : `"start": "node ."`}
  }
}`
}).run()).result;

process.chdir(root);

await writeFile("package.json", packageJSON);
await writeFile("README.md", generateREADME(pm, type));
await writeFile(".env", "TOKEN=");


if (type === "ts") await writeFile("globals.d.ts", generateGlobalTypes(pm))
if (config !== null) await writeFile("tsconfig.json", generateTSConfig(config, pm));

await mkdir("src");
process.chdir(resolve("src"));
await cp(new URL("./index-template.ts", import.meta.url), `./index.${type}`);

execSync(`${pm} install ${dependencies.join(" ")}`, {
    stdio: "inherit"
});

if (pm === "bun") devDeps.push("bun-types");
else devDeps.push("ts-node", "@types/node");

execSync(`${pm} install -D ${devDeps.join(" ")}`, {
    stdio: "inherit"
})


console.log(c.green("All done!"));