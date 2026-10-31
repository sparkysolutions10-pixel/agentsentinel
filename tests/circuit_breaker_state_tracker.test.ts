import { describe, it, expect } from 'vitest';
import { CircuitBreakerStateTracker } from '../src/utils/circuit_breaker_state_tracker.js';

describe('CircuitBreakerStateTracker', () => {
  it('transitions from CLOSED to OPEN after failureThreshold', () => {
    const cb = new CircuitBreakerStateTracker(3, 5000);
    expect(cb.getState()).toBe('CLOSED');

    cb.recordFailure();
    cb.recordFailure();
    expect(cb.getState()).toBe('CLOSED');

    cb.recordFailure(1000); // 3rd failure trips
    expect(cb.getState(1000)).toBe('OPEN');
    expect(cb.canExecute(1000)).toBe(false);
  });

  it('transitions to HALF_OPEN after cooldown and recovers to CLOSED on successes', () => {
    const cb = new CircuitBreakerStateTracker(2, 5000, 2);
    cb.recordFailure(1000);
    cb.recordFailure(1000); // OPEN until 6000

    expect(cb.getState(7000)).toBe('HALF_OPEN');
    expect(cb.canExecute(7000)).toBe(true);

    cb.recordSuccess(); // 1st success
    expect(cb.getState(7000)).toBe('HALF_OPEN');

    cb.recordSuccess(); // 2nd success reaches successThreshold
    expect(cb.getState(7000)).toBe('CLOSED');
  });
});
