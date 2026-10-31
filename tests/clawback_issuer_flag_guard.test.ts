import { describe, it, expect } from 'vitest';
import { createClawbackIssuerFlagRule } from '../src/web3/clawback_issuer_flag_guard.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('ClawbackAssetIssuerFlagGuard', () => {
  const rule = createClawbackIssuerFlagRule({ allowClawbackAssets: false });

  it('allows assets with standard non-revocable flags', () => {
    const context: ToolCallContext = {
      id: 'tx_safe_asset',
      toolName: 'stellar_buy_tokens',
      params: { assetFlags: { authRevocable: false, authClawbackEnabled: false } },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).toBeNull();
  });

  it('blocks assets with clawback enabled flag', () => {
    const context: ToolCallContext = {
      id: 'tx_clawback_asset',
      toolName: 'stellar_buy_tokens',
      params: { assetFlags: { authClawbackEnabled: true } },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('REVOCABLE_ASSET_DETECTED');
  });
});
