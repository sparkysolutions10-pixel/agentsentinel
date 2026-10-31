/**
 * CircuitBreakerStateTracker - Fault isolation state machine.
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitBreakerStateTracker {
  private state: CircuitState = 'CLOSED';
  private failureCount: number = 0;
  private consecutiveSuccesses: number = 0;
  private nextAttemptTimestamp: number = 0;

  constructor(
    public readonly failureThreshold: number = 5,
    public readonly cooldownMs: number = 10000,
    public readonly successThreshold: number = 2
  ) {}

  public getState(now: number = Date.now()): CircuitState {
    if (this.state === 'OPEN' && now >= this.nextAttemptTimestamp) {
      this.state = 'HALF_OPEN';
      this.consecutiveSuccesses = 0;
    }
    return this.state;
  }

  public recordSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.consecutiveSuccesses++;
      if (this.consecutiveSuccesses >= this.successThreshold) {
        this.state = 'CLOSED';
        this.failureCount = 0;
      }
    } else if (this.state === 'CLOSED') {
      this.failureCount = 0;
    }
  }

  public recordFailure(now: number = Date.now()): void {
    this.failureCount++;
    if (this.state === 'HALF_OPEN' || this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttemptTimestamp = now + this.cooldownMs;
    }
  }

  public canExecute(now: number = Date.now()): boolean {
    const current = this.getState(now);
    return current === 'CLOSED' || current === 'HALF_OPEN';
  }
}
