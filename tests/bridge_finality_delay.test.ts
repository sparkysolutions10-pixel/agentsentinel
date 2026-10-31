import { describe, it, expect } from 'vitest';
import { createBridgeFinalityDelayRule } from '../src/web3/bridge_finality_delay.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('BridgeFinalityDelayMonitor', () => {
  const rule = createBridgeFinalityDelayRule({ minConfirmations: 30 });

  it('allows bridge claim when confirmation count meets threshold', () => {
    const context: ToolCallContext = {
      id: 'tx_finality_valid',
      toolName: 'bridge_claim_release',
      params: { confirmations: 45, amount: 1000 },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).toBeNull();
  });

  it('blocks bridge claim when confirmation count is below threshold', () => {
    const context: ToolCallContext = {
      id: 'tx_finality_premature',
      toolName: 'bridge_claim_release',
      params: { confirmations: 12, amount: 1000 },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('INSUFFICIENT_FINALITY_CONFIRMATIONS:12<30');
  });

  it('blocks bridge claim when confirmation count is completely missing', () => {
    const context: ToolCallContext = {
      id: 'tx_finality_missing',
      toolName: 'bridge_claim_release',
      params: { amount: 1000 },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toBe('MISSING_CONFIRMATION_COUNT');
  });
});
