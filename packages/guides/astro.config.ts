import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
    integrations: [
        starlight({
            title: "Lilybird",
            description: "Lightweight and performant Discord API Wrapper built by the community for the community.",
            customCss: ["./src/styles/index.css"],
            lastUpdated: true,
            social: {
                github: "https://github.com/Didas-git/lilybird",
                discord: "https://discord.gg/vER3sh7uyY"
            },
            editLink: {
                baseUrl: "https://github.com/Didas-git/lilybird/edit/main/packages/guides"
            },
            expressiveCode: {
                plugins: [pluginLineNumbers(), pluginCollapsibleSections()],
                defaultProps: {
                    showLineNumbers: false
                }
            },
            head: [
                {
                    tag: "link",
                    attrs: {
                        type: "application/json+oembed",
                        href: "/oembed/main.json"
                    }
                },
                {
                    tag: "meta",
                    attrs: {
                        name: "theme-color",
                        content: "#ad9ee7"
                    }
                }
            ],
            sidebar: [
                {
                    label: "Philosophy",
                    link: "philosophy"
                },
                {
                    label: "Community",
                    link: "community"
                },
                {
                    label: "Guides",
                    autogenerate: {
                        directory: "/guides"
                    }
                },
                {
                    label: "API",
                    autogenerate: {
                        directory: "/api",
                        collapsed: true
                    }
                },
                {
                    label: "Documentation",
                    link: "https://docs.lilybird.dev"
                }
            ]
        })
    ]
});
