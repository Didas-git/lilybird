import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
    integrations: [
        starlight({
            title: "Lilybird",
            description: "Lightweight and performant Discord client built by the community for the community.",
            customCss: ["./src/styles/index.css"],
            lastUpdated: true,
            social: {
                github: "https://github.com/Didas-git/lilybird"
            },
            editLink: {
                baseUrl: "https://github.com/Didas-git/lilybird/edit/main/packages/docs"
            },
            expressiveCode: {
                plugins: [pluginLineNumbers()],
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
                            label: "Transformers",
                            // collapsed: true,
                            // autogenerate: {
                            //     directory: "/modules/transformers"
                            // }
                            items: [
                                {
                                    label: "Coming soon...",
                                    items: []
                                }
                            ]
                        },
                        {
                            label: "Handlers",
                            collapsed: true,
                            items: [
                                {
                                    label: "Simple",
                                    collapsed: true,
                                    autogenerate: {
                                        directory: "/modules/handlers/simple"
                                    }
                                },
                                {
                                    label: "Advanced",
                                    collapsed: true,
                                    badge: {
                                        text: "Beta",
                                        variant: "danger"

                                    },
                                    autogenerate: {
                                        directory: "/modules/handlers/default"
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    label: "Documentation",
                    // collapsed: true,
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
