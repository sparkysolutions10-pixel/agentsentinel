import { describe, it, expect } from 'vitest';
import { createSorobanSandwichDetectorRule } from '../src/web3/soroban_sandwich_detector.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Soroban Mempool Sandwich Detector (#919, #920)', () => {
  const rule = createSorobanSandwichDetectorRule({ feeSpikeRatioThreshold: 3.0 });

  it('allows swap during normal fee conditions', () => {
    const ctx: ToolCallContext = {
      id: 'sandwich-ok-1',
      toolName: 'soroban_swap',
      params: {
        networkBaseFee: 100,
        currentMempoolFee: 150, // 1.5x <= 3.0x
      },
      timestamp: Date.now(),
    };
    expect(rule.evaluate(ctx)).toBeNull();
  });

  it('blocks swap when predatory mempool fee spike occurs (#920)', () => {
    const ctx: ToolCallContext = {
      id: 'sandwich-spiked-1',
      toolName: 'soroban_swap',
      params: {
        networkBaseFee: 100,
        currentMempoolFee: 450, // 4.5x > 3.0x
      },
      timestamp: Date.now(),
    };
    const violation = rule.evaluate(ctx);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.reason).toContain('Predatory MEV sandwich attack condition detected');
  });
});
