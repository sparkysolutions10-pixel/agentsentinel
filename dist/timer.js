/**
 * High-resolution latency profiling utility using process.hrtime.bigint().
 */
export class HRTimer {
    startTime = 0n;
    endTime = 0n;
    constructor() {
        this.start();
    }
    /**
     * Starts or resets the timer.
     */
    start() {
        this.startTime = process.hrtime.bigint();
        this.endTime = 0n;
        return this;
    }
    /**
     * Stops the timer and captures elapsed time.
     */
    stop() {
        this.endTime = process.hrtime.bigint();
        return this;
    }
    /**
     * Returns elapsed nanoseconds.
     */
    elapsedNs() {
        const end = this.endTime !== 0n ? this.endTime : process.hrtime.bigint();
        return end - this.startTime;
    }
    /**
     * Returns elapsed microseconds with fractional precision.
     */
    elapsedUs() {
        return Number(this.elapsedNs()) / 1000;
    }
    /**
     * Returns elapsed milliseconds rounded to 3 decimal places.
     */
    elapsedMs() {
        return Number((Number(this.elapsedNs()) / 1_000_000).toFixed(3));
    }
}
/**
 * Creates and starts a new HRTimer instance.
 */
export function startTimer() {
    return new HRTimer();
}
//# sourceMappingURL=timer.js.map