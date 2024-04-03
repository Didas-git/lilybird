process.emitWarning("Deprecated import!", {
    code: "HANDLERS_DEPRECATED",
    detail: "This way of importing the simple handler has been deprecated, please use `@lilybird/handlers/simple` instead."
});

export type * from "./simple/message-commands.js";
export type * from "./simple/slash-command.js";
export type * from "./simple/events.js";

export * from "./simple/handler.js";
