import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
    integrations: [
        starlight({
            title: "Lilybird",
            social: {
                github: "https://github.com/Didas-git/lilybird"
            },
            editLink: {
                baseUrl: "https://github.com/Didas-git/lilybird/edit/main/packages/docs"
            },
            customCss: [
				"./src/styles/index.css",
			],
            head: [
                {
                    tag: "link",
                    attrs: {
                        type: "application/json+oembed",
                        href: "oembed/main.json"
                    }
                },
                {
                    tag: "meta",
                    attrs: {
                        name: "theme-color",
                        content: "#ff00ef"
                    }
                }
            ],
            sidebar: [
                {
                    label: "Guides",
                    autogenerate: { directory: "guides" }
                },
                {
                    label: "Reference",
                    autogenerate: { directory: "reference" },
                },
            ],
        }),
    ],
});
