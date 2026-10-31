import { describe, it, expect } from 'vitest';
import { createStellarPathHopsLimiterRule } from '../src/web3/stellar_path_hops_limiter.js';
import { Verdict } from '../src/types.js';

describe('StellarPathHopsLimiterRule', () => {
  it('allows paths with at most 5 hops', () => {
    const rule = createStellarPathHopsLimiterRule({ maxHops: 5 });
    const violation = rule.evaluate({
      toolName: 'stellar_path_payment_send',
      params: { path: ['A', 'B', 'C'] } // 3 hops
    });
    expect(violation).toBeNull();
  });

  it('blocks paths with more than 5 hops', () => {
    const rule = createStellarPathHopsLimiterRule({ maxHops: 5 });
    const violation = rule.evaluate({
      toolName: 'stellar_path_payment_send',
      params: { path: ['A', 'B', 'C', 'D', 'E', 'F'] } // 6 hops
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('PATH_HOPS_EXCEEDED');
  });
});
