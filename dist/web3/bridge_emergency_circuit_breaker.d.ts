/**
 * AgentSentinel - Bridge Emergency Halt Circuit Breaker
 * Monitors rolling bridge outflow volume and halts all autonomous bridge
 * operations upon detecting anomalous volume surges or exploit drain patterns.
 */
import { SentinelRule } from '../types.js';
export interface BridgeCircuitBreakerConfig {
    maxWindowVolume?: number;
    windowMs?: number;
}
export declare class BridgeCircuitBreakerState {
    isTripped: boolean;
    tripReason: string;
    history: {
        timestamp: number;
        amount: number;
    }[];
    reset(): void;
    trip(reason: string): void;
}
export declare function createBridgeCircuitBreakerRule(config?: BridgeCircuitBreakerConfig, state?: BridgeCircuitBreakerState): SentinelRule;
//# sourceMappingURL=bridge_emergency_circuit_breaker.d.ts.map