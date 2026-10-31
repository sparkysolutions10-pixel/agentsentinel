import { describe, it, expect } from 'vitest';
import { createSep10WebAuthRule } from '../src/web3/sep10_webauth_validator.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Sep10WebAuthValidator', () => {
  const rule = createSep10WebAuthRule({ expectedHomeDomain: 'stellar.org' });

  it('allows valid challenge matching domain and time bounds', () => {
    const context: ToolCallContext = {
      id: 'tx_sep10_valid',
      toolName: 'sep10_sign_challenge',
      params: { homeDomain: 'stellar.org', expiresAt: Date.now() + 60000 },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).toBeNull();
  });

  it('blocks challenge referencing unauthorized domain', () => {
    const context: ToolCallContext = {
      id: 'tx_sep10_phishing',
      toolName: 'sep10_sign_challenge',
      params: { homeDomain: 'phishing-stellar.net', expiresAt: Date.now() + 60000 },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('DOMAIN_MISMATCH');
  });
});
