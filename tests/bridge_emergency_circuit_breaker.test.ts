import { describe, it, expect } from 'vitest';
import { createBridgeCircuitBreakerRule, BridgeCircuitBreakerState } from '../src/web3/bridge_emergency_circuit_breaker.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('BridgeEmergencyHaltCircuitBreaker', () => {
  it('allows operations within the safe rolling volume threshold', () => {
    const state = new BridgeCircuitBreakerState();
    const rule = createBridgeCircuitBreakerRule({ maxWindowVolume: 100000 }, state);

    const context: ToolCallContext = {
      id: 'tx_normal_vol',
      toolName: 'bridge_transfer_outflow',
      params: { amount: 30000 },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).toBeNull();
    expect(state.isTripped).toBe(false);
  });

  it('trips circuit breaker when cumulative volume spikes over threshold', () => {
    const state = new BridgeCircuitBreakerState();
    const rule = createBridgeCircuitBreakerRule({ maxWindowVolume: 100000 }, state);
    const now = Date.now();

    rule.evaluate({
      id: 'tx_vol_1',
      toolName: 'bridge_transfer_outflow',
      params: { amount: 60000 },
      timestamp: now
    });

    const tripViolation = rule.evaluate({
      id: 'tx_vol_spike',
      toolName: 'bridge_transfer_outflow',
      params: { amount: 50000 },
      timestamp: now + 1000
    });

    expect(tripViolation).not.toBeNull();
    expect(tripViolation?.verdict).toBe(Verdict.BLOCK);
    expect(state.isTripped).toBe(true);

    // Subsequent operations are blocked immediately while tripped
    const nextViolation = rule.evaluate({
      id: 'tx_after_trip',
      toolName: 'bridge_transfer_outflow',
      params: { amount: 100 },
      timestamp: now + 2000
    });
    expect(nextViolation?.detectedPattern).toContain('CIRCUIT_BREAKER_TRIPPED');
  });

  it('allows reset of circuit breaker state by security operator', () => {
    const state = new BridgeCircuitBreakerState();
    state.trip('Manual test trip');
    expect(state.isTripped).toBe(true);

    state.reset();
    expect(state.isTripped).toBe(false);
    expect(state.history.length).toBe(0);
  });
});
