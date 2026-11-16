/**
 * AgentSentinel - HTTP Exponential Backoff Interceptor
 * Implements randomized full-jitter exponential backoff on HTTP 429 and 503 responses
 * to prevent RPC rate limiting bans and thunderous herd stampedes.
 */
export interface BackoffConfig {
    baseDelayMs?: number;
    maxDelayMs?: number;
    maxRetries?: number;
}
export declare class HttpExponentialBackoffInterceptor {
    private baseDelay;
    private maxDelay;
    private maxRetries;
    constructor(config?: BackoffConfig);
    calculateJitterDelay(attempt: number): number;
    executeWithRetry<T>(operation: () => Promise<T>, onRetry?: (attempt: number, delayMs: number) => void): Promise<T>;
}
//# sourceMappingURL=http_backoff_interceptor.d.ts.map