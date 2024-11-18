export type HandlerListener = (identifier: HandlerIdentifier, payload: unknown) => void;

export const enum HandlerIdentifier {
    FRESH,
    CACHED,
    CHANGES,
    LOADING,
    INVALID_PATH,
    INVALID_COMMAND,
    SKIPPING_HANDLER,
    COMPILED
}
