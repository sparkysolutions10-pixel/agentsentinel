import { describe, it, expect } from 'vitest';
import { createVectorCircuitBreakerRule } from '../src/rag/vector_circuit_breaker.js';
import { Verdict } from '../src/types.js';

describe('VectorCircuitBreaker', () => {
  it('trips circuit breaker after consecutive failures', () => {
    const rule = createVectorCircuitBreakerRule(3);

    rule.evaluate({ toolName: 'vector_req', params: { simulatedDownstreamError: true } });
    rule.evaluate({ toolName: 'vector_req', params: { simulatedDownstreamError: true } });
    const trip = rule.evaluate({ toolName: 'vector_req', params: { simulatedDownstreamError: true } });

    expect(trip).not.toBeNull();
    expect(trip?.verdict).toBe(Verdict.BLOCK);

    // Reset
    rule.evaluate({ toolName: 'vector_req', params: { resetCircuitBreaker: true } });
    const healthy = rule.evaluate({ toolName: 'vector_req', params: {} });
    expect(healthy).toBeNull();
  });
});
