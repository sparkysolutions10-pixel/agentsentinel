/**
 * High-resolution latency profiling utility using process.hrtime.bigint().
 */
export class HRTimer {
  private startTime: bigint = 0n;
  private endTime: bigint = 0n;

  constructor() {
    this.start();
  }

  /**
   * Starts or resets the timer.
   */
  public start(): this {
    this.startTime = process.hrtime.bigint();
    this.endTime = 0n;
    return this;
  }

  /**
   * Stops the timer and captures elapsed time.
   */
  public stop(): this {
    this.endTime = process.hrtime.bigint();
    return this;
  }

  /**
   * Returns elapsed nanoseconds.
   */
  public elapsedNs(): bigint {
    const end = this.endTime !== 0n ? this.endTime : process.hrtime.bigint();
    return end - this.startTime;
  }

  /**
   * Returns elapsed microseconds with fractional precision.
   */
  public elapsedUs(): number {
    return Number(this.elapsedNs()) / 1000;
  }

  /**
   * Returns elapsed milliseconds rounded to 3 decimal places.
   */
  public elapsedMs(): number {
    return Number((Number(this.elapsedNs()) / 1_000_000).toFixed(3));
  }
}

/**
 * Creates and starts a new HRTimer instance.
 */
export function startTimer(): HRTimer {
  return new HRTimer();
}
