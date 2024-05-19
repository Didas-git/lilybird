export const enum TransformerReturnType {
    /** The transformer only returns a single element. */
    SINGLE,
    /**
     * The transformer returns an array with multiple elements.
     * This elements will be spread onto the listener call.
     */
    MULTIPLE
}

export const enum DebugIdentifier {
    Message = "WS_MESSAGE",
    Heartbeat = "HEARTBEAT",
    ACK = "ACK",
    HeartbeatRequest = "NEED_HEARTBEAT",
    Identify = "IDENTIFY",
    Resume = "RESUME",
    InvalidSession = "INVALID_SESSION",
    Reconnect = "RECONNECT",
    WSError = "ERROR",
    MissingACK = "MISSING_ACK",
    ZombieConnection = "ZOMBIE",
    AttemptingResume = "ATTEMPTING_RESUME",
    CloseCode = "CLOSE_CODE",
    CompiledListeners = "LISTENERS",
    RESTCall = "REST_IN",
    RESTError = "REST_ERROR"
}
