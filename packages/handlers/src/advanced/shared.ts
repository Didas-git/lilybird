export type HandlerListener = (identifier: HandlerIdentifier, payload: unknown) => void;

export const enum HandlerIdentifier {
    FRESH = "FRESH",
    CACHED = "CACHED",
    CHANGES = "CHANGES",
    LOADING = "LOADING",
    INVALID_PATH = "INVALID",
    INVALID_COMMAND = "INVALID_COMMAND",
    SKIPPING_HANDLER = "SIPPING_HANDLER",
    COMPILED = "COMPILED"
}
