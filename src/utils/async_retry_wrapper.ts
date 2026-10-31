/**
 * AsyncRetryWrapper - Operation retry utility with error predicate filter.
 */

export interface RetryOptions {
  maxRetries: number;
  delayMs?: number;
  isRetryable?: (error: any) => boolean;
}

export class AsyncRetryWrapper {
  public static async execute<T>(
    operation: (attempt: number) => Promise<T>,
    options: RetryOptions
  ): Promise<T> {
    const maxRetries = Math.max(0, options.maxRetries);
    let attempt = 0;

    while (true) {
      try {
        return await operation(attempt);
      } catch (err) {
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
