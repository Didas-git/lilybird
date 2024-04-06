import { defaultTransformers } from "@lilybird/transformers";
import { join } from "node:path";

import type { GlobalSlashCommand, GuildSlashCommand, SlashCommand } from "./slash-command.js";
import type { DefaultTransformers, Interaction, Message } from "@lilybird/transformers";
import type { MessageCommand } from "./message-commands.js";
import type { Event } from "./events.js";

import type {
    ClientListeners,
    ClientOptions,
    Client
} from "lilybird";

interface HandlerDirectories {
    slashCommands?: string;
    messageCommands?: string;
    listeners?: string;
}

export class Handler {
    protected readonly guildSlashCommands = new Map<string, GuildSlashCommand>();
    protected readonly globalSlashCommands = new Map<string, GlobalSlashCommand>();
    protected readonly messageCommands = new Map<string, MessageCommand>();
    protected readonly events = new Map<string, Event>();
    protected readonly messageCommandAliases = new Map<string, string>();

    protected readonly dirs: HandlerDirectories;
    protected readonly prefix: string;

    readonly #globMatcher = new Bun.Glob("**/*.{ts,tsx,js,jsx}");

    public constructor(dirs: HandlerDirectories, prefix?: string) {
        this.dirs = dirs;
        this.prefix = prefix ?? "!";
    }

    public async registerGlobalCommands(client: Client): Promise<void> {
        await client.rest.bulkOverwriteGlobalApplicationCommand(client.user.id, [...this.globalSlashCommands.values()].map((e) => e.data));
    }

    public async registerGuildCommands(client: Client): Promise<void> {
        for await (const command of this.guildSlashCommands.values()) {
            if (Array.isArray(command.post)) {
                const temp: Array<Promise<unknown>> = [];
                for (let i = 0; i < command.post.length; i++) temp.push(client.rest.createGuildApplicationCommand(client.user.id, command.post[i], command.data));
                await Promise.all(temp);
            } else await client.rest.createGuildApplicationCommand(client.user.id, command.post, command.data);
        }
    }

    public async readSlashCommandDir(dir: string | undefined = this.dirs.slashCommands): Promise<boolean> {
        if (typeof dir === "undefined") return false;

        const files = this.#globMatcher.scan(dir);

        for await (const fileName of files) {
            if (fileName.endsWith(".d.ts")) continue;

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            const command: SlashCommand = (await import(join(dir, fileName))).default;
            if (typeof command === "undefined") continue;

            if (fileName.startsWith("/guild") || command.post !== "GLOBAL") this.guildSlashCommands.set(command.data.name, <GuildSlashCommand>command);
            else this.globalSlashCommands.set(command.data.name, command);
        }

        return true;
    }

    public async readEventDir(dir: string | undefined = this.dirs.listeners): Promise<boolean> {
        if (typeof dir === "undefined") return false;

        const files = this.#globMatcher.scan(dir);

        for await (const fileName of files) {
            if (fileName.endsWith(".d.ts")) continue;

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            const event: Event = (await import(join(dir, fileName))).default;
            if (typeof event === "undefined") continue;

            this.events.set(event.event, event);
        }

        return true;
    }

    public async readMessageCommandDir(dir: string | undefined = this.dirs.messageCommands): Promise<boolean> {
        if (typeof dir === "undefined") return false;

        const files = this.#globMatcher.scan(dir);

        for await (const fileName of files) {
            if (fileName.endsWith(".d.ts")) continue;

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            const command: MessageCommand = (await import(join(dir, fileName))).default;
            if (typeof command === "undefined") continue;

            if (typeof command.alias !== "undefined" && command.alias.length > 0) {
                if (command.alias.length === 1) this.messageCommandAliases.set(command.alias[0], command.name);
                else for (let i = 0, { length } = command.alias; i < length; i++) this.messageCommandAliases.set(command.alias[i], command.name);
            }

            this.messageCommands.set(command.name, command);
        }

        return true;
    }

    private async onInteraction(interaction: Interaction): Promise<void> {
        if (interaction.isApplicationCommandInteraction()) {
            await this.globalSlashCommands.get(interaction.data.name)?.run(interaction);
            if (interaction.inGuild()) await this.guildSlashCommands.get(interaction.data.name)?.run(interaction);
        } else if (interaction.isAutocompleteInteraction()) {
            await this.globalSlashCommands.get(interaction.data.name)?.autocomplete?.(interaction);
            if (interaction.inGuild()) await this.guildSlashCommands.get(interaction.data.name)?.autocomplete?.(interaction);
        }
    }

    private async onMessage(message: Message): Promise<void> {
        if (message.author.bot || (await message.fetchChannel()).isDM()) return;

        if (message.content?.startsWith(this.prefix)) {
            const args = message.content.slice(this.prefix.length).trim().split(/\s+/g);
            if (args.length === 0) return;

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const alias = args.shift()!.toLowerCase();
            let command = this.messageCommands.get(alias);
            let name: string | undefined = alias;

            if (typeof command === "undefined") {
                name = this.messageCommandAliases.get(alias);
                if (typeof name !== "string") return;
                command = this.messageCommands.get(name);
                if (typeof command === "undefined") return;
            }

            if (command.enabled ?? true) await command.run(message, args, { name, alias });
        }
    }

    public async buildListeners(): Promise<ClientListeners<DefaultTransformers>> {
        const slashCommandsExist = await this.readSlashCommandDir();
        const messageCommandsExist = await this.readMessageCommandDir();
        const eventsExist = await this.readEventDir();

        let interactionCreateFn: Exclude<ClientListeners<any>["interactionCreate"], undefined> | undefined = undefined;
        let messageCreateFn: Exclude<ClientListeners<any>["messageCreate"], undefined> | undefined = undefined;

        const listeners: ClientListeners<DefaultTransformers> & Record<string, unknown> = {} as never;

        if (eventsExist) {
            for (const [name, event] of this.events) {
                if (name === "interactionCreate") {
                    interactionCreateFn = <never>event.run;
                    continue;
                }

                if (name === "messageCreate") {
                    messageCreateFn = <never>event.run;
                    continue;
                }

                listeners[name] = event.run;
            }
        }

        if (!slashCommandsExist) listeners.interactionCreate = <never>interactionCreateFn;
        else if (typeof interactionCreateFn !== "undefined") {
            listeners.interactionCreate = async (interaction) => {
                //@ts-expect-error It is being checked above...
                await interactionCreateFn(interaction);
                await this.onInteraction(interaction);
            };
        } else {
            listeners.interactionCreate = async (interaction) => {
                await this.onInteraction(interaction);
            };
        }

        if (!messageCommandsExist) listeners.messageCreate = <never>messageCreateFn;
        else if (typeof messageCreateFn !== "undefined") {
            listeners.messageCreate = async (message) => {
                //@ts-expect-error It is being checked above...
                await messageCreateFn(message);
                await this.onMessage(message);
            };
        } else {
            listeners.messageCreate = async (message) => {
                await this.onMessage(message);
            };
        }

        return listeners;
    }
}

// eslint-disable-next-line @typescript-eslint/ban-types
type Expand<T> = T extends Function ? T : { [K in keyof T]: T[K] };

export async function createHandler({
    dirs,
    prefix
}: {
    dirs: HandlerDirectories,
    prefix?: string | undefined
}): Promise<Expand<Pick<Required<ClientOptions<DefaultTransformers>>, "listeners" | "transformers" | "setup" | "customCacheKeys">>> {
    const handler = new Handler(dirs, prefix);

    return {
        transformers: defaultTransformers,
        listeners: await handler.buildListeners(),
        customCacheKeys: {
            guild_voice_states: "voiceStates"
        },
        setup: async (client) => {
            await handler.registerGlobalCommands(client);
            await handler.registerGuildCommands(client);
        }
    };
}
