/**
 * CircuitBreakerStateTracker - Fault isolation state machine.
 */
export class CircuitBreakerStateTracker {
    failureThreshold;
    cooldownMs;
    successThreshold;
    state = 'CLOSED';
    failureCount = 0;
    consecutiveSuccesses = 0;
    nextAttemptTimestamp = 0;
    constructor(failureThreshold = 5, cooldownMs = 10000, successThreshold = 2) {
        this.failureThreshold = failureThreshold;
        this.cooldownMs = cooldownMs;
        this.successThreshold = successThreshold;
    }
    getState(now = Date.now()) {
        if (this.state === 'OPEN' && now >= this.nextAttemptTimestamp) {
            this.state = 'HALF_OPEN';
            this.consecutiveSuccesses = 0;
        }
        return this.state;
    }
    recordSuccess() {
        if (this.state === 'HALF_OPEN') {
            this.consecutiveSuccesses++;
            if (this.consecutiveSuccesses >= this.successThreshold) {
                this.state = 'CLOSED';
                this.failureCount = 0;
            }
        }
        else if (this.state === 'CLOSED') {
            this.failureCount = 0;
        }
    }
    recordFailure(now = Date.now()) {
        this.failureCount++;
        if (this.state === 'HALF_OPEN' || this.failureCount >= this.failureThreshold) {
            this.state = 'OPEN';
            this.nextAttemptTimestamp = now + this.cooldownMs;
        }
    }
    canExecute(now = Date.now()) {
        const current = this.getState(now);
        return current === 'CLOSED' || current === 'HALF_OPEN';
    }
}
//# sourceMappingURL=circuit_breaker_state_tracker.js.map