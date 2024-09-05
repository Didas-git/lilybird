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
    WSMessage,
    Heartbeat,
    ACK,
    HeartbeatRequest,
    Identify,
    Resume,
    InvalidSession,
    Reconnect,
    WSError,
    MissingACK,
    ZombieConnection,
    AttemptingResume,
    CloseCode,
    CompiledListeners,
    RESTCall,
    RESTError
}
