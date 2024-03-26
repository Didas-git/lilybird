export const enum TransformerReturnType {
    SINGLE,
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
    UnknownCode = "UNKNOWN_CODE",
    CompiledListeners = "LISTENERS"
}
