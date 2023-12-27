import { ChannelType } from "lilybird";

import type { GlobalSlashCommand, GuildSlashCommand, SlashCommand } from "./slash-command.js";
import type { MessageCommand } from "./message-commands.js";
import type { Event } from "./events.js";

import type {
    ClientEventListeners,
    BaseClientOptions,
    Interaction,
    Message,
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
    protected readonly messageCommands = new Map<Array<string>, MessageCommand>();
    protected readonly events = new Map<Event["event"], Event>();

    protected readonly dirs: HandlerDirectories;
    protected readonly prefix: string;

    public constructor(dirs: HandlerDirectories, prefix?: string) {
        this.dirs = dirs;
        this.prefix = prefix ?? "!";
    }

    public async registerGlobalCommands(client: Client): Promise<void> {
        for await (const command of this.globalSlashCommands.values()) await client.rest.createGlobalApplicationCommand(client.user.id, command.data);
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

        const router = new Bun.FileSystemRouter({
            fileExtensions: [".ts", ".tsx", ".js", ".jsx"],
            style: "nextjs",
            dir
        });

        for (let i = 0, entries = Object.entries(router.routes), { length } = entries; i < length; i++) {
            const [key, val] = entries[i];

            // Lazy solution, could probably be better
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, no-await-in-loop
            const file: SlashCommand = (await import(val)).default;
            if (typeof file === "undefined") continue;

            if (key.startsWith("/guild") || file.post !== "GLOBAL") this.guildSlashCommands.set(file.data.name, <GuildSlashCommand>file);
            else this.globalSlashCommands.set(file.data.name, file);
        }

        return true;
    }

    public async readEventDir(dir: string | undefined = this.dirs.listeners): Promise<boolean> {
        if (typeof dir === "undefined") return false;

        const router = new Bun.FileSystemRouter({
            fileExtensions: [".ts", ".tsx", ".js", ".jsx"],
            style: "nextjs",
            dir
        });

        for (let i = 0, values = Object.values(router.routes), { length } = values; i < length; i++) {
            const val = values[i];

            // Lazy solution, could probably be better
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, no-await-in-loop
            const file: Event = (await import(val)).default;
            if (typeof file === "undefined") continue;

            this.events.set(file.event, file);
        }

        return true;
    }

    public async readMessageCommandDir(dir: string | undefined = this.dirs.messageCommands): Promise<boolean> {
        if (typeof dir === "undefined") return false;

        const router = new Bun.FileSystemRouter({
            fileExtensions: [".ts", ".tsx", ".js", ".jsx"],
            style: "nextjs",
            dir
        });

        for (let i = 0, values = Object.values(router.routes), { length } = values; i < length; i++) {
            const val = values[i];

            // Lazy solution, could probably be better
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, no-await-in-loop
            const file: MessageCommand = (await import(val)).default;
            if (typeof file === "undefined") continue;

            this.messageCommands.set([file.name, ...file.alias ?? []], file);
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
        if (message.author.bot || (await message.client.rest.getChannel(message.channelId)).type === ChannelType.DM) return;

        if (message.content?.startsWith(this.prefix)) {
            const args = message.content.slice(this.prefix.length).trim().split(/\s+/g);
            if (args.length === 0) return;

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const cmd = args.shift()!.toLowerCase();
            const key = [...this.messageCommands.keys()].find((keys) => keys.includes(cmd));
            if (typeof key === "undefined") return;

            const command = this.messageCommands.get(key);
            if (typeof command === "undefined") return;
            if (command.enabled ?? true) await command.run(message, args);
        }
    }

    public async buildListeners(): Promise<ClientEventListeners> {
        const slashCommandsExist = await this.readSlashCommandDir();
        const messageCommandsExist = await this.readMessageCommandDir();
        const eventsExist = await this.readEventDir();
        // eslint-disable-next-line func-style
        let interactionCreateFn: Exclude<ClientEventListeners["interactionCreate"], undefined> | undefined = undefined;

        // eslint-disable-next-line func-style
        let messageCreateFn: Exclude<ClientEventListeners["messageCreate"], undefined> | undefined = undefined;

        const listeners: ClientEventListeners = {};

        if (eventsExist) {
            for (const [name, event] of this.events) {
                if (name === "interactionCreate") {
                    interactionCreateFn = event.run;
                    continue;
                }

                if (name === "messageCreate") {
                    messageCreateFn = event.run;
                    continue;
                }

                listeners[name] = event.run;
            }
        }

        if (!slashCommandsExist) listeners.interactionCreate = interactionCreateFn;
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

        if (!messageCommandsExist) listeners.messageCreate = messageCreateFn;
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
}): Promise<Expand<Pick<Required<BaseClientOptions>, "listeners" | "setup">>> {
    const handler = new Handler(dirs, prefix);

    return {
        listeners: await handler.buildListeners(),
        setup: async (client) => {
            await handler.registerGlobalCommands(client);
            await handler.registerGuildCommands(client);
        }
    };
}
