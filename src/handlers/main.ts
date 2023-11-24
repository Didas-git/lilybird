import type { SlashCommand, Event, GlobalSlashCommand, GuildSlashCommand } from ".";
import type { BaseClientOptions, ClientEventListeners } from "..";
import type { Client } from "../client";

interface HandlerDirectories {
    slashCommands?: string;
    messageCommands?: string;
    listeners?: string;
}

export class Handler {
    protected readonly guildSlashCommands = new Map<string, GuildSlashCommand>();
    protected readonly globalSlashCommands = new Map<string, GlobalSlashCommand>();
    // readonly #messageCommands = new Map<Array<string>, >();
    protected readonly events = new Map<Event["event"], Event>();

    readonly #dirs: HandlerDirectories;

    public constructor(dirs: HandlerDirectories) {
        this.#dirs = dirs;
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

    public async readSlashCommandDir(dir: string | undefined = this.#dirs.slashCommands): Promise<void> {

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

    public async readEventDir(dir: string | undefined = this.#dirs.listeners): Promise<void> {

        if (typeof dir === "undefined") throw new Error("Attempt to load slash commands failed");

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

    public buildListeners(): ClientEventListeners {
        let interactionCreateFn: Exclude<ClientEventListeners["interactionCreate"], undefined> = () => { return; };

        const listeners: ClientEventListeners = {};

        this.events.forEach((event, name) => {
            if (name === "interactionCreate") {
                interactionCreateFn = event.run;
                return;
            }

            listeners[name] = event.run;
        });

        listeners.interactionCreate = (interaction) => {
            interactionCreateFn(interaction);

            if (interaction.isApplicationCommandInteraction()) {
                this.globalSlashCommands.get(interaction.data.name)?.run(interaction);

                if (interaction.inGuild()) {
                    this.guildSlashCommands.get(interaction.data.name)?.run(interaction);
                }
            } else if (interaction.isAutocompleteInteraction()) {
                this.globalSlashCommands.get(interaction.data.name)?.autocomplete?.(interaction);
                if (interaction.inGuild()) {
                    this.guildSlashCommands.get(interaction.data.name)?.autocomplete?.(interaction);
                }
            }
        };

        return listeners;
    }

    // public async readMessageCommandDir(dir: string | undefined = this.#dirs.messageCommands): Promise<void> {

    //     if (typeof dir === "undefined") throw new Error("Attempt to load slash commands failed");

    //     const router = new Bun.FileSystemRouter({
    //         fileExtensions: [".ts", ".tsx", ".js", ".jsx"],
    //         style: "nextjs",
    //         dir
    //     });

    //     for (let i = 0, entries = Object.entries(router.routes), length = entries.length; i < length; i++) {
    //         const [key, val] = entries[i];

    //         const file: SlashCommand = (await import(val)).default;

    //         if (typeof file === "undefined") continue;

    //         this.#messageCommands.set([file.name, ...file.aliases], file);
    //     }
    // }
}

// eslint-disable-next-line @typescript-eslint/ban-types
type Expand<T> = T extends Function ? T : { [K in keyof T]: T[K] };

export async function createHandler(dirs: HandlerDirectories): Promise<Expand<Pick<Required<BaseClientOptions>, "listeners" | "setup">>> {
    const handler = new Handler(dirs);

    dirs.slashCommands && await handler.readSlashCommandDir();
    dirs.listeners && await handler.readEventDir();

    return {
        listeners: handler.buildListeners(),
        setup: async (client) => {
            await handler.registerGlobalCommands(client);
            await handler.registerGuildCommands(client);
        }
    };
}