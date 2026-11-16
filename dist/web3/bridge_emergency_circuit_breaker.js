/**
 * AgentSentinel - Bridge Emergency Halt Circuit Breaker
 * Monitors rolling bridge outflow volume and halts all autonomous bridge
 * operations upon detecting anomalous volume surges or exploit drain patterns.
 */
import { Verdict } from '../types.js';
export class BridgeCircuitBreakerState {
    isTripped = false;
    tripReason = '';
    history = [];
    reset() {
        this.isTripped = false;
        this.tripReason = '';
        this.history = [];
    }
    trip(reason) {
        this.isTripped = true;
        this.tripReason = reason;
    }
}
export function createBridgeCircuitBreakerRule(config = {}, state = new BridgeCircuitBreakerState()) {
    const maxVolume = config.maxWindowVolume ?? 250000;
    const windowMs = config.windowMs ?? 3600000;
    return {
        id: 'bridge-emergency-circuit-breaker',
        name: 'Bridge Emergency Halt Circuit Breaker',
        category: 'custom',
        priority: 95,
        enabled: true,
        evaluate(context) {
            const tool = context.toolName.toLowerCase();
            if (!tool.includes('bridge') && !tool.includes('transfer') && !tool.includes('drain') && !tool.includes('withdraw')) {
                return null;
            }
            if (state.isTripped) {
                return {
                    ruleId: 'bridge-emergency-circuit-breaker',
                    ruleName: 'Bridge Emergency Halt Circuit Breaker',
                    severity: 'critical',
                    verdict: Verdict.BLOCK,
                    reason: `Bridge execution blocked: circuit breaker is TRIPPED (${state.tripReason}). All cross-chain operations halted.`,
                    detectedPattern: `CIRCUIT_BREAKER_TRIPPED:${state.tripReason}`
                };
            }
            const params = context.params || {};
            const amount = Number(params.amount ?? params.value ?? params.volume ?? 0);
            if (amount <= 0 || isNaN(amount)) {
                return null;
            }
            const now = context.timestamp || Date.now();
            const cutoff = now - windowMs;
            state.history = state.history.filter(h => h.timestamp > cutoff);
            const currentRollingVolume = state.history.reduce((sum, h) => sum + h.amount, 0);
            if (currentRollingVolume + amount > maxVolume) {
                state.trip(`Rolling volume exceeded limit: ${(currentRollingVolume + amount).toLocaleString()} > ${maxVolume.toLocaleString()}`);
                return {
                    ruleId: 'bridge-emergency-circuit-breaker',
                    ruleName: 'Bridge Emergency Halt Circuit Breaker',
                    severity: 'critical',
                    verdict: Verdict.BLOCK,
                    reason: `Bridge emergency circuit breaker TRIPPED: rolling volume ${(currentRollingVolume + amount).toLocaleString()} exceeds threshold ${maxVolume.toLocaleString()}. Bridge operations frozen.`,
                    detectedPattern: `OUTFLOW_SURGE_TRIPWIRE:${currentRollingVolume + amount}>${maxVolume}`
                };
            }
            state.history.push({ timestamp: now, amount });
            return null;
        }
    };
}
//# sourceMappingURL=bridge_emergency_circuit_breaker.js.map