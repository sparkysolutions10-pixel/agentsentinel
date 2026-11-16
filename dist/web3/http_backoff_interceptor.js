/**
 * AgentSentinel - HTTP Exponential Backoff Interceptor
 * Implements randomized full-jitter exponential backoff on HTTP 429 and 503 responses
 * to prevent RPC rate limiting bans and thunderous herd stampedes.
 */
export class HttpExponentialBackoffInterceptor {
    baseDelay;
    maxDelay;
    maxRetries;
    constructor(config = {}) {
        this.baseDelay = config.baseDelayMs ?? 200;
        this.maxDelay = config.maxDelayMs ?? 5000;
        this.maxRetries = config.maxRetries ?? 3;
    }
    calculateJitterDelay(attempt) {
        const exponential = Math.min(this.maxDelay, this.baseDelay * Math.pow(2, attempt));
        return Math.floor(Math.random() * exponential);
    }
    async executeWithRetry(operation, onRetry) {
        let lastError;
        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                return await operation();
            }
            catch (err) {
                lastError = err;
                const status = err?.status || err?.statusCode || (err?.message?.includes('429') ? 429 : 500);
                if ((status === 429 || status === 503) && attempt < this.maxRetries) {
                    const delay = this.calculateJitterDelay(attempt);
                    if (onRetry) {
                        onRetry(attempt + 1, delay);
                    }
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                throw err;
            }
        }
        throw lastError;
    }
}
//# sourceMappingURL=http_backoff_interceptor.js.map