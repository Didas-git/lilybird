declare module "bun" {
    interface Env {
        readonly TOKEN: string;
        readonly TEST_CHANNEL_ID: string;
        readonly TEST_GUILD_ID: string;
        readonly SEARCH_KEY: string;
        readonly CX: string;
    }
}
