/**
 * ErrorRateCalculator - Sliding window error rate and classification monitor.
 */
export declare class ErrorRateCalculator {
    readonly windowMs: number;
    private events;
    constructor(windowMs?: number);
    private prune;
    recordSuccess(now?: number): void;
    recordError(errorType?: string, now?: number): void;
    getErrorRate(now?: number): number;
    getErrorCountByType(now?: number): Record<string, number>;
    getTotalEvents(now?: number): number;
    isExceedingThreshold(threshold: number, minEvents?: number, now?: number): boolean;
    reset(): void;
}
//# sourceMappingURL=error_rate_calculator.d.ts.map