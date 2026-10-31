/**
 * ErrorRateCalculator - Sliding window error rate and classification monitor.
 */

interface ErrorEvent {
  timestamp: number;
  isError: boolean;
  errorType?: string;
}

export class ErrorRateCalculator {
  private events: ErrorEvent[] = [];

  constructor(public readonly windowMs: number = 60000) {
    if (windowMs <= 0) {
      throw new Error('Window must be positive');
    }
  }

  private prune(now: number): void {
    const cutoff = now - this.windowMs;
    this.events = this.events.filter(e => e.timestamp > cutoff);
  }

  public recordSuccess(now: number = Date.now()): void {
    this.prune(now);
    this.events.push({ timestamp: now, isError: false });
  }

  public recordError(errorType: string = 'generic', now: number = Date.now()): void {
    this.prune(now);
    this.events.push({ timestamp: now, isError: true, errorType });
  }

  public getErrorRate(now: number = Date.now()): number {
    this.prune(now);
    if (this.events.length === 0) return 0;

    const errorCount = this.events.filter(e => e.isError).length;
    return Number((errorCount / this.events.length).toFixed(4));
  }

  public getErrorCountByType(now: number = Date.now()): Record<string, number> {
    this.prune(now);
    const breakdown: Record<string, number> = {};
    for (const e of this.events) {
      if (e.isError && e.errorType) {
        breakdown[e.errorType] = (breakdown[e.errorType] ?? 0) + 1;
      }
    }
    return breakdown;
  }

  public getTotalEvents(now: number = Date.now()): number {
    this.prune(now);
    return this.events.length;
  }

  public isExceedingThreshold(threshold: number, minEvents: number = 10, now: number = Date.now()): boolean {
    this.prune(now);
    if (this.events.length < minEvents) return false;
    return this.getErrorRate(now) >= threshold;
  }

  public reset(): void {
    this.events = [];
  }
}
