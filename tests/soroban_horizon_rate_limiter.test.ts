import { describe, it, expect } from 'vitest';
import { createSorobanHorizonRateLimiterRule } from '../src/web3/soroban_horizon_rate_limiter.js';
import { Verdict } from '../src/types.js';

describe('SorobanHorizonRateLimiterRule', () => {
  it('allows Horizon requests within safe quota limits', () => {
    const rule = createSorobanHorizonRateLimiterRule({ maxRequestsPerMinute: 10 });
    const violation = rule.evaluate({
      toolName: 'stellar_horizon_query',
      params: { endpoint: '/accounts/G...' }
    });
    expect(violation).toBeNull();
  });

  it('blocks requests when remaining quota is 0', () => {
    const rule = createSorobanHorizonRateLimiterRule();
    const violation = rule.evaluate({
      toolName: 'stellar_horizon_query',
      params: { endpoint: '/ledgers', rateLimitRemaining: 0 }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('HORIZON_RATE_LIMIT_EXHAUSTED');
  });

  it('blocks requests when per-minute limit is breached', () => {
    const rule = createSorobanHorizonRateLimiterRule({ maxRequestsPerMinute: 2 });
    rule.evaluate({ toolName: 'stellar_horizon_query', params: {} });
    rule.evaluate({ toolName: 'stellar_horizon_query', params: {} });
    const violation = rule.evaluate({ toolName: 'stellar_horizon_query', params: {} });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });
});
