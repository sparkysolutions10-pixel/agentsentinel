import { describe, it, expect } from 'vitest';
import { createSorobanClawbackDetectorRule } from '../src/web3/soroban_clawback_detector.js';
import { Verdict } from '../src/types.js';

describe('SorobanClawbackDetectorRule', () => {
  it('allows trading safe assets without clawback flags', () => {
    const rule = createSorobanClawbackDetectorRule();
    const violation = rule.evaluate({
      toolName: 'soroban_trade_asset',
      params: { assetCode: 'USDC', flags: { clawback_enabled: false, auth_revocable: false } }
    });
    expect(violation).toBeNull();
  });

  it('blocks assets with clawback_enabled flag', () => {
    const rule = createSorobanClawbackDetectorRule({ blockOnClawbackEnabled: true });
    const violation = rule.evaluate({
      toolName: 'soroban_trade_asset',
      params: { assetCode: 'RISK_COIN', flags: { clawback_enabled: true } }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('high');
    expect(violation?.detectedPattern).toContain('CLAWBACK_FLAG_DETECTED');
  });

  it('requires confirmation if blockOnClawbackEnabled is false', () => {
    const rule = createSorobanClawbackDetectorRule({ blockOnClawbackEnabled: false });
    const violation = rule.evaluate({
      toolName: 'soroban_trade_asset',
      params: { assetCode: 'REVOCABLE_ASSET', flags: { auth_revocable: true } }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.CONFIRM);
  });
});
