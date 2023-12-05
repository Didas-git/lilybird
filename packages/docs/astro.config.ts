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
                        content: "#f49ac2"
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
                                    label: "Message Components",
                                    link: "docs/jsx/components"
                                },
                                {
                                    label: "Attachments",
                                    link: "docs/jsx/attachment"
                                }
                            ]
                        },
                        {
                            label: "Handlers",
                            collapsed: true,
                            badge: {
                                text: "Beta",
                                variant: "danger"
                            },
                            items: [
                                {
                                    label: "API",
                                    link: "docs/handlers/the-api",
                                    badge: {
                                        text: "Internals",
                                        variant: "success"
                                    }
                                },
                                {
                                    label: "Handling Application Commands",
                                    link: "docs/handlers/application-commands"
                                },
                                {
                                    label: "Handling Events",
                                    link: "docs/handlers/events"
                                },
                                {
                                    label: "Handling Message Commands",
                                    link: "docs/handlers/message-commands"
                                }
                            ]
                        }
                    ]
                }
            ]
        })
    ]
});
