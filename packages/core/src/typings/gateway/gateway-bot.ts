export interface GetGatewayBot {
    url: string;
    shards: number;
    session_start_limit: SessionStartLimit;
}

export interface SessionStartLimit {
    total: number;
    remaining: number;
    reset_after: number;
    max_concurrency: number;
}
