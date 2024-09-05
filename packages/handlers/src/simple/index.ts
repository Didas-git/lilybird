process.emitWarning("Simple handlers are deprecated!", {
    code: "HANDLERS_DEPRECATED",
    detail: "Simple handlers have been deprecated, please use `@lilybird/handlers/advanced` instead."
});

export type * from "./application-command.js";
export type * from "./message-commands.js";
export type * from "./events.js";

export * from "./handler.js";
