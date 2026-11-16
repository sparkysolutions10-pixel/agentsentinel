/**
 * AsyncRetryWrapper - Operation retry utility with error predicate filter.
 */
export interface RetryOptions {
    maxRetries: number;
    delayMs?: number;
    isRetryable?: (error: any) => boolean;
}
export declare class AsyncRetryWrapper {
    static execute<T>(operation: (attempt: number) => Promise<T>, options: RetryOptions): Promise<T>;
}
//# sourceMappingURL=async_retry_wrapper.d.ts.map