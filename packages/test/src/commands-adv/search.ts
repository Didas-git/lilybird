/* eslint-disable @typescript-eslint/naming-convention */
import { $applicationCommand } from "@lilybird/handlers/advanced";
import { ApplicationCommandOptionType } from "lilybird";

import type { ApplicationCommandData, AutocompleteData, Interaction } from "@lilybird/transformers";
import type { Embed } from "lilybird";

interface GoogleAPIResponse {
    kind: string;
    url: Record<string, unknown>;
    queries: Record<string, unknown>;
    context: {
        title: string
    };
    searchInformation: Record<string, unknown>;
    items: Array<GoogleAPIItem>;
}

interface GoogleAPIItem {
    kind: string;
    title: string;
    htmlTitle: string;
    link: string;
    displayLink: string;
    snippet: string;
    htmlSnippet: string;
    cacheId: string;
    formattedUrl: string;
    htmlFormattedUrl: string;
    pagemap: {
        cse_thumbnail: Array<{ src: string, width: string, height: string }>,
        xfn: Array<Record<string, unknown>>,
        BreadcrumbList: Array<Record<string, unknown>>,
        metatags: Array<Metatag>,
        cse_image: Array<{ src: string }>
    };
}

interface Metatag {
    "og:image": string;
    "theme-color": string;
    "og:type": string;
    "og:image:width": string;
    "og:image:alt": string;
    "twitter:card": string;
    "og:site_name": string;
    "og:title": string;
    "og:image:height": string;
    "og:image:type": string;
    "og:description": string;
    "twitter:creator": string;
    viewport: string;
    "og:locale": string;
    position: string;
    "og:url": string;
}

const localCache = new Map<string, Metatag>();

function populateCache(items: Array<GoogleAPIItem>): void {
    for (let i = 0, { length } = items; i < length; i++) {
        const item = items[i];
        const meta = item.pagemap.metatags;

        if (localCache.has(item.cacheId)) continue;

        localCache.set(item.cacheId, meta[0]);
    }
}

$applicationCommand({
    name: "search",
    description: "search mdn",
    options: [
        {
            type: ApplicationCommandOptionType.STRING,
            name: "query",
            description: "the query",
            required: true,
            autocomplete: true
        },
        {
            type: ApplicationCommandOptionType.USER,
            name: "user",
            description: "the user to ping"
        }
    ],
    handle: async (interaction: Interaction<ApplicationCommandData>): Promise<void> => {
        const cacheId = interaction.data.getString("query", true);
        const tags = localCache.get(cacheId);
        if (!tags) throw new Error("WTF");

        const userId = interaction.data.getUser("user");

        const embed: Embed.Structure = {
            title: tags["og:title"],
            description: tags["og:description"],
            url: tags["og:url"],

            image: { url: tags["og:image"] }
        };

        await interaction.reply({
            content: userId ? `<@${userId}> learn how to fucking google` : "",
            embeds: [embed]
        });
    },
    autocomplete: async (interaction: Interaction<AutocompleteData>): Promise<void> => {
        const query = interaction.data.getFocused<string>().value;
        if (query.length === 0) return;

        const url = `https://www.googleapis.com/customsearch/v1?key=${process.env.SEARCH_KEY}&cx=${process.env.CX}&q=${query}&num=10`;

        const response = await fetch(url);
        const body: GoogleAPIResponse = await response.json() as never;

        populateCache(body.items);

        await interaction.showChoices(body.items.map((val) => ({ name: val.title, value: val.cacheId })));
    }
});

