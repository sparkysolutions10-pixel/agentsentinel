import { describe, it, expect } from 'vitest';
import { createSubentryCountRule } from '../src/web3/subentry_count_limiter.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('SubentryCountLimiter', () => {
  const rule = createSubentryCountRule({ maxSubentries: 950 });

  it('allows subentry creation when below threshold', () => {
    const context: ToolCallContext = {
      id: 'tx_subentry_safe',
      toolName: 'stellar_create_trustline',
      params: { currentSubentries: 50, newSubentries: 1 },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).toBeNull();
  });

  it('blocks subentry creation when resulting count exceeds threshold', () => {
    const context: ToolCallContext = {
      id: 'tx_subentry_exceeded',
      toolName: 'stellar_create_trustline',
      params: { currentSubentries: 949, newSubentries: 5 },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('SUBENTRY_CEILING_EXCEEDED:954>950');
  });
});
