/**
 * AsyncRetryWrapper - Operation retry utility with error predicate filter.
 */
export class AsyncRetryWrapper {
    static async execute(operation, options) {
        const maxRetries = Math.max(0, options.maxRetries);
        let attempt = 0;
        while (true) {
            try {
                return await operation(attempt);
            }
            catch (err) {
                if (attempt >= maxRetries) {
                    throw err;
                }
                if (options.isRetryable && !options.isRetryable(err)) {
                    throw err;
                }
                attempt++;
                if (options.delayMs && options.delayMs > 0) {
                    await new Promise(r => setTimeout(r, options.delayMs));
                }
            }
        }
    }
}
//# sourceMappingURL=async_retry_wrapper.js.map