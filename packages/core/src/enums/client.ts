export const enum TransformerReturnType {
    SINGLE,
    MULTIPLE
}

export const enum CachingDelegationType {
    /** This will use the default caching strategies and manager */
    DEFAULT,
    /**
     * Use a custom caching manager
     * Adding to the cache is still controlled by the client
     * but you can use an adapter to use something like redis as your cache
     */
    EXTERNAL,
    /**
     * This still uses the built-in CachingManager
     * But instead of the client managing it
     * only the applied and existing listeners will have control over the cache
     *
     * In sum: Cache is manually controlled by the transformers
     */
    TRANSFORMERS
}
