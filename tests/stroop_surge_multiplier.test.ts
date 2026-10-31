import { describe, it, expect } from 'vitest';
import { createStroopSurgeMultiplierRule } from '../src/web3/stroop_surge_multiplier.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('StroopSurgeMultiplierClamp', () => {
  const rule = createStroopSurgeMultiplierRule({ maxMultiplier: 3.0 });

  it('allows fee within the 3.0x surge multiplier', () => {
    const context: ToolCallContext = {
      id: 'tx_normal_fee',
      toolName: 'stellar_submit_tx',
      params: { fee: 250, rollingMedianFee: 100 },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).toBeNull();
  });

  it('blocks fee exceeding the 3.0x surge multiplier', () => {
    const context: ToolCallContext = {
      id: 'tx_surge_excessive',
      toolName: 'stellar_submit_tx',
      params: { fee: 500, rollingMedianFee: 100 },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('SURGE_MULTIPLIER_EXCEEDED:500>300');
  });
});
