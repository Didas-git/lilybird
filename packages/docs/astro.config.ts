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
                    label: "Guides",
                    autogenerate: {
                        directory: "/guides"
                    }
                },
                {
                    label: "API",
                    badge: {
                        text: "Beta",
                        variant: "danger"

                    },
                    autogenerate: {
                        directory: "/api",
                        collapsed: true
                    }
                },
                {
                    label: "Modules",
                    items: [
                        {
                            label: "JSX Components",
                            collapsed: true,
                            autogenerate: {
                                directory: "/modules/jsx"
                            }
                        },
                        {
                            label: "Handlers",
                            badge: {
                                text: "Beta",
                                variant: "danger"

                            },
                            collapsed: true,
                            autogenerate: {
                                directory: "/modules/handlers"
                            }
                        }
                    ]
                },
                {
                    label: "Documentation",
                    items: [
                        {
                            label: "Coming soon...",
                            items: []
                        }
                    ]
                }
            ]
        })
    ]
});
