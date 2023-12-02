import { ChannelType, type BaseClientOptions, type ClientEventListeners } from "..";
import type { SlashCommand, Event, GlobalSlashCommand, GuildSlashCommand } from ".";
import type { Interaction, InteractionData } from "../factories/interaction";
import type { MessageCommand } from "./message-commands";
import type { Message } from "../factories/message";
import type { Client } from "../client";

interface HandlerDirectories {
    slashCommands?: string;
    messageCommands?: string;
    listeners?: string;
}

export class Handler {
    protected readonly guildSlashCommands = new Map<string, GuildSlashCommand>();
    protected readonly globalSlashCommands = new Map<string, GlobalSlashCommand>();
    protected readonly messageCommands = new Map<Array<string>, MessageCommand>();
    protected readonly events = new Map<Event["event"], Event>();

    protected readonly dirs: HandlerDirectories;
    protected readonly prefix: string;

    public constructor(dirs: HandlerDirectories, prefix?: string) {
        this.dirs = dirs;
        this.prefix = prefix ?? "!";
    }

    public async registerGlobalCommands(client: Client): Promise<void> {
        for await (const command of this.globalSlashCommands.values()) {
            await client.rest.createGlobalApplicationCommands(client.user.id, command.data);
        }
    }

    public async registerGuildCommands(client: Client): Promise<void> {
        for await (const command of this.guildSlashCommands.values()) {
            if (Array.isArray(command.post)) {
                for (let i = 0; i < command.post.length; i++) {
                    await client.rest.createGuildApplicationCommand(client.user.id, command.post[i], command.data);
                }
            } else {
                await client.rest.createGuildApplicationCommand(client.user.id, command.post, command.data);
            }
        }

    }

    public async readSlashCommandDir(dir: string | undefined = this.dirs.slashCommands): Promise<void> {
        if (typeof dir === "undefined") throw new Error("Attempt to load slash commands failed");

        const router = new Bun.FileSystemRouter({
            fileExtensions: [".ts", ".tsx", ".js", ".jsx"],
            style: "nextjs",
            dir
        });

        for (let i = 0, entries = Object.entries(router.routes), length = entries.length; i < length; i++) {
            const [key, val] = entries[i];

            const file: SlashCommand = (await import(val)).default;

            if (typeof file === "undefined") continue;

            if (key.startsWith("/guild") || file.post !== "GLOBAL") {
                this.guildSlashCommands.set(file.data.name, <GuildSlashCommand>file);
            } else {
                this.globalSlashCommands.set(file.data.name, file);
            }
        }
    }

    public async readEventDir(dir: string | undefined = this.dirs.listeners): Promise<void> {
        if (typeof dir === "undefined") throw new Error("Attempt to load events failed");

        const router = new Bun.FileSystemRouter({
            fileExtensions: [".ts", ".tsx", ".js", ".jsx"],
            style: "nextjs",
            dir
        });

        for (let i = 0, values = Object.values(router.routes), length = values.length; i < length; i++) {
            const val = values[i];

            const file: Event = (await import(val)).default;

            if (typeof file === "undefined") continue;

            this.events.set(file.event, file);
        }
    }

    public async readMessageCommandDir(dir: string | undefined = this.dirs.messageCommands): Promise<void> {
        if (typeof dir === "undefined") throw new Error("Attempt to load message commands failed");

        const router = new Bun.FileSystemRouter({
            fileExtensions: [".ts", ".tsx", ".js", ".jsx"],
            style: "nextjs",
            dir
        });

        for (let i = 0, values = Object.values(router.routes), length = values.length; i < length; i++) {
            const val = values[i];

            const file: MessageCommand = (await import(val)).default;

            if (typeof file === "undefined") continue;

            this.messageCommands.set([file.name, ...file.alias ?? []], file);
        }
    }

    private async onInteraction(interaction: Interaction<InteractionData>): Promise<void> {
        if (interaction.isApplicationCommandInteraction()) {
            await this.globalSlashCommands.get(interaction.data.name)?.run(interaction);

            if (interaction.inGuild()) {
                await this.guildSlashCommands.get(interaction.data.name)?.run(interaction);
            }
        } else if (interaction.isAutocompleteInteraction()) {
            await this.globalSlashCommands.get(interaction.data.name)?.autocomplete?.(interaction);
            if (interaction.inGuild()) {
                await this.guildSlashCommands.get(interaction.data.name)?.autocomplete?.(interaction);
            }
        }
    }

    private async onMessage(message: Message): Promise<void> {
        if (
            message.author.bot
            || (await message.client.rest.getChannel(message.id)).type === ChannelType.DM
        ) return;

        if (message.content?.startsWith(this.prefix)) {
            const args = message.content.slice(this.prefix.length).trim().split(/\s+/g);
            if (args.length === 0) return;

            // We can assert in this line because we know for sure `args` has at least 1 in length
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const cmd = args.shift()!.toLowerCase();
            const key = [...this.messageCommands.keys()].find((keys) => keys.includes(cmd));
            if (typeof key === "undefined") return;

            const command = this.messageCommands.get(key);
            if (typeof command === "undefined") return;

            if (command.enabled ?? true) await command.run(message, args);
        }
    }

    public buildListeners(): ClientEventListeners {
        let interactionCreateFn: Exclude<ClientEventListeners["interactionCreate"], undefined> = () => { return; };

        let messageCreateFn: Exclude<ClientEventListeners["messageCreate"], undefined> = () => { return; };

        const listeners: ClientEventListeners = {};

        this.events.forEach((event, name) => {
            if (name === "interactionCreate") {
                interactionCreateFn = event.run;
                return;
            }

            listeners[name] = event.run;
        });

        listeners.interactionCreate = async (interaction) => {
            await interactionCreateFn(interaction);
            await this.onInteraction(interaction);
        };

        listeners.messageCreate = async (message) => {
            await messageCreateFn(message);
            await this.onMessage(message);
        };

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
}): Promise<Expand<Pick<Required<BaseClientOptions>, "listeners" | "setup">>> {
    const handler = new Handler(dirs, prefix);

    dirs.slashCommands && await handler.readSlashCommandDir();
    dirs.listeners && await handler.readEventDir();
    dirs.messageCommands && await handler.readMessageCommandDir();

    return {
        listeners: handler.buildListeners(),
        setup: async (client) => {
            await handler.registerGlobalCommands(client);
            await handler.registerGuildCommands(client);
        }
    };
}