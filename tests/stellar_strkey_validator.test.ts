import { describe, it, expect } from 'vitest';
import { createStellarStrKeyValidatorRule } from '../src/web3/stellar_strkey_validator.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Stellar StrKey Address Validator (#899, #900)', () => {
  const rule = createStellarStrKeyValidatorRule();

  it('allows valid Stellar G-account and C-contract addresses', () => {
    const ctx: ToolCallContext = {
      id: 'strkey-valid-1',
      toolName: 'stellar_payment',
      params: {
        destination: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
        contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
      },
      timestamp: Date.now(),
    };

    const violation = rule.evaluate(ctx);
    expect(violation).toBeNull();
  });

  it('rejects malformed or invalid StrKey public addresses (#900)', () => {
    const ctx: ToolCallContext = {
      id: 'strkey-invalid-1',
      toolName: 'stellar_payment',
      params: {
        destination: 'G1234_NOT_BASE32_INVALID_LENGTH',
      },
      timestamp: Date.now(),
    };

    const violation = rule.evaluate(ctx);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.reason).toContain('Invalid Stellar address/contract StrKey format');
  });

  it('rejects Ethereum hex addresses passed to Stellar tools', () => {
    const ctx: ToolCallContext = {
      id: 'strkey-eth-address-1',
      toolName: 'stellar_transaction',
      params: {
        to: '0x40B7d9273092822341860F5610168861351e71eb',
      },
      timestamp: Date.now(),
    };

    const violation = rule.evaluate(ctx);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });
});
