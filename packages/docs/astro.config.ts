import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
// import { createStarlightTypeDocPlugin } from "starlight-typedoc";
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// const [createCoreDocumentation, coreDocumentationSidebar] = createStarlightTypeDocPlugin();

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
            // plugins: [
            //     createCoreDocumentation({
            //         entryPoints: ["../core/src/index.ts"],
            //         output: "documentation",
            //         tsconfig: "../core/tsconfig.json",
            //         sidebar: {
            //             label: "Documentation",
            //             collapsed: true
            //         },
            //         typeDoc: {
            //             useCodeBlocks: true,
            //             parametersFormat: "table",
            //             enumMembersFormat: "table",
            //             publicPath: "/documentation/"
            //         }
            //     })
            // ],
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
                }
                // coreDocumentationSidebar
            ]
        })
    ]
});
