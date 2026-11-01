export class SlidingWindowCounter {
  private windowMs: number;
  private events: number[] = [];

  constructor(windowMs: number) {
    this.windowMs = windowMs;
  }

  public increment(count: number = 1, now: number = Date.now()): void {
    for (let i = 0; i < count; i++) {
      this.events.push(now);
    }
    this.prune(now);
  }

  public getCount(now: number = Date.now()): number {
    this.prune(now);
    return this.events.length;
  }

  private prune(now: number): void {
    const cutoff = now - this.windowMs;
    while (this.events.length > 0 && this.events[0] <= cutoff) {
      this.events.shift();
    }
  }
}
