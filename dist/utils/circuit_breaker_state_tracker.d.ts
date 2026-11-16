/**
 * CircuitBreakerStateTracker - Fault isolation state machine.
 */
export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';
export declare class CircuitBreakerStateTracker {
    readonly failureThreshold: number;
    readonly cooldownMs: number;
    readonly successThreshold: number;
    private state;
    private failureCount;
    private consecutiveSuccesses;
    private nextAttemptTimestamp;
    constructor(failureThreshold?: number, cooldownMs?: number, successThreshold?: number);
    getState(now?: number): CircuitState;
    recordSuccess(): void;
    recordFailure(now?: number): void;
    canExecute(now?: number): boolean;
}
//# sourceMappingURL=circuit_breaker_state_tracker.d.ts.map