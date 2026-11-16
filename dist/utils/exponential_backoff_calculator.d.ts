/**
 * ExponentialBackoffCalculator - Exponential backoff with jitter options.
 */
export type JitterMode = 'none' | 'full' | 'equal';
export declare class ExponentialBackoffCalculator {
    static calculateDelayMs(attempt: number, baseDelayMs?: number, maxDelayMs?: number, jitter?: JitterMode, randomSource?: () => number): number;
}
//# sourceMappingURL=exponential_backoff_calculator.d.ts.map