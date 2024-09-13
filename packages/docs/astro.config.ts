/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import { createStarlightTypeDocPlugin } from "starlight-typedoc";
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

const [createCoreDocumentation, coreDocumentationSidebar] = createStarlightTypeDocPlugin();
const [createTransformersDocumentation, transformersDocumentationSidebar] = createStarlightTypeDocPlugin();

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
                baseUrl: "https://github.com/Didas-git/lilybird/edit/main/packages/docs"
            },
            expressiveCode: {
                plugins: [pluginLineNumbers(), pluginCollapsibleSections()],
                defaultProps: {
                    showLineNumbers: false
                }
            },
            plugins: [
                createCoreDocumentation({
                    entryPoints: ["../core/src/index.ts"],
                    output: "documentation",
                    tsconfig: "../core/tsconfig.json",
                    sidebar: {
                        label: "Documentation",
                        collapsed: true
                    },
                    typeDoc: {
                        sort: ["enum-value-ascending", "source-order"],
                        parametersFormat: "table",
                        enumMembersFormat: "table",
                        publicPath: "/documentation/"
                    }
                }),
                createTransformersDocumentation({
                    entryPoints: ["../transformers/src/index.ts"],
                    output: "modules/transformers/documentation",
                    tsconfig: "../transformers/tsconfig.json",
                    sidebar: {
                        label: "Documentation",
                        collapsed: true
                    },
                    typeDoc: {
                        sort: ["enum-value-ascending", "source-order"],
                        excludeExternals: true,
                        parametersFormat: "table",
                        enumMembersFormat: "table",
                        publicPath: "/modules/transformers/documentation/"
                    }
                })
            ],
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
                    label: "Modules",
                    collapsed: true,
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
                            collapsed: true,
                            items: [transformersDocumentationSidebar]
                        },
                        {
                            label: "Handlers",
                            collapsed: true,
                            items: [
                                {
                                    label: "Simple",
                                    collapsed: true,
                                    badge: {
                                        text: "Deprecated",
                                        variant: "danger"

                                    },
                                    autogenerate: {
                                        directory: "/modules/handlers/simple"
                                    }
                                },
                                {
                                    label: "Advanced",
                                    collapsed: true,
                                    badge: {
                                        text: "New",
                                        variant: "tip"

                                    },
                                    autogenerate: {
                                        directory: "/modules/handlers/default"
                                    }
                                }
                            ]
                        }
                    ]
                },
                coreDocumentationSidebar
            ]
        })
    ]
});
