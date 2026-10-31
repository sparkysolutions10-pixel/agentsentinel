import { describe, it, expect } from 'vitest';
import { createStellarMultisigVerifierRule } from '../src/web3/stellar_multisig_verifier.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Stellar Multi-Signature Threshold Verifier (#901, #902)', () => {
  const rule = createStellarMultisigVerifierRule();

  it('allows multi-sig transactions where total signer weight satisfies threshold', () => {
    const ctx: ToolCallContext = {
      id: 'multisig-ok-1',
      toolName: 'stellar_multisig_tx',
      params: {
        operationThreshold: 'medium',
        thresholds: { low: 10, medium: 20, high: 30 },
        signers: [
          { key: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5', weight: 10 },
          { key: 'GAAAZZZ555...', weight: 15 },
        ], // 25 >= 20
      },
      timestamp: Date.now(),
    };

    const violation = rule.evaluate(ctx);
    expect(violation).toBeNull();
  });

  it('rejects transactions failing threshold weights (#902)', () => {
    const ctx: ToolCallContext = {
      id: 'multisig-deficit-1',
      toolName: 'stellar_multisig_tx',
      params: {
        operationThreshold: 'high',
        thresholds: { low: 10, medium: 20, high: 30 },
        signers: [
          { key: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5', weight: 10 },
        ], // 10 < 30
      },
      timestamp: Date.now(),
    };

    const violation = rule.evaluate(ctx);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.reason).toContain('Multi-signature weight deficit');
  });
});
