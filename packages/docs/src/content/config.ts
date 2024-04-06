import { defineCollection } from "astro:content";
import { docsSchema, i18nSchema } from "@astrojs/starlight/schema";

export const collections = <unknown>{
    docs: defineCollection({ schema: docsSchema() }),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    i18n: defineCollection({ type: "data", schema: i18nSchema() })
};
