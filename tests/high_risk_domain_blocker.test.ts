import { describe, it, expect } from 'vitest';
import { createHighRiskDomainBlockerRule } from '../src/web3/high_risk_domain_blocker.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('HighRiskDomainContractBlocker', () => {
  const rule = createHighRiskDomainBlockerRule();

  it('allows safe legitimate contract interactions', () => {
    const context: ToolCallContext = {
      id: 'tx_safe_contract',
      toolName: 'soroban_call_contract',
      params: { contractId: 'CA3D52RZSECPH7QAC7R2R4GPPG7BH5X', domain: 'stellar.org' },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).toBeNull();
  });

  it('blocks interaction targeting blacklisted phishing domain', () => {
    const context: ToolCallContext = {
      id: 'tx_phishing_target',
      toolName: 'soroban_call_contract',
      params: { domain: 'https://phishing-stellar-dex.fake/swap' },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('BLACKLISTED_TARGET_DETECTED');
  });
});
