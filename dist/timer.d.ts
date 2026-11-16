/**
 * High-resolution latency profiling utility using process.hrtime.bigint().
 */
export declare class HRTimer {
    private startTime;
    private endTime;
    constructor();
    /**
     * Starts or resets the timer.
     */
    start(): this;
    /**
     * Stops the timer and captures elapsed time.
     */
    stop(): this;
    /**
     * Returns elapsed nanoseconds.
     */
    elapsedNs(): bigint;
    /**
     * Returns elapsed microseconds with fractional precision.
     */
    elapsedUs(): number;
    /**
     * Returns elapsed milliseconds rounded to 3 decimal places.
     */
    elapsedMs(): number;
}
/**
 * Creates and starts a new HRTimer instance.
 */
export declare function startTimer(): HRTimer;
//# sourceMappingURL=timer.d.ts.map