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
            customCss: ["./src/styles/index.css"],
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
                        content: "#f82277"
                    }
                }
            ],
            sidebar: [
                {
                    label: "Philosophy",
                    link: "philosophy"
                },
                {
                    label: "Guides",
                    items: [
                        {
                            label: "Getting Started",
                            link: "/guides/getting-started"
                        },
                        {
                            label: "Manual Setup",
                            link: "/guides/manual-setup"
                        },
                        {
                            label: "Configuring JSX",
                            link: "/guides/configuring-jsx"
                        }
                    ]
                },
                {
                    label: "Documentation",
                    items: [
                        {
                            label: "JSX Components",
                            collapsed: true,
                            badge: {
                                text: "Beta",
                                variant: "danger"
                            },
                            items: [
                                {
                                    label: "Embeds",
                                    link: "docs/jsx/embed"
                                },
                                {
                                    label: "Application Commands",
                                    link: "docs/jsx/command"
                                },
                                {
                                    label: "Attachments",
                                    link: "docs/jsx/attachment"
                                }
                            ]
                        }
                    ]
                }
            ]
        })
    ]
});
