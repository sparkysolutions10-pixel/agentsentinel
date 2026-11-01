export class LeakyBucketRateLimiter {
  private capacity: number;
  private leakRatePerMs: number;
  private water: number = 0;
  private lastLeakTime: number | null = null;

  constructor(capacity: number, leakRatePerSecond: number) {
    this.capacity = capacity;
    this.leakRatePerMs = leakRatePerSecond / 1000;
  }

  public allowRequest(cost: number = 1, now: number = Date.now()): boolean {
    this.leak(now);
    if (this.water + cost <= this.capacity) {
      this.water += cost;
      return true;
    }
    return false;
  }

  private leak(now: number): void {
    if (this.lastLeakTime === null) {
      this.lastLeakTime = now;
      return;
    }
    const elapsed = now - this.lastLeakTime;
    if (elapsed > 0) {
      const leaked = elapsed * this.leakRatePerMs;
      this.water = Math.max(0, this.water - leaked);
      this.lastLeakTime = now;
    }
  }

  public getWaterLevel(): number {
    return this.water;
  }
}
