import { describe, it, expect } from 'vitest';
import { createStellarNetworkPassphraseValidatorRule, PUBNET_PASSPHRASE, TESTNET_PASSPHRASE } from '../src/web3/stellar_network_boundary.js';
import { Verdict } from '../src/types.js';

describe('StellarNetworkPassphraseValidatorRule', () => {
  it('allows Testnet passphrase in test environment', () => {
    const rule = createStellarNetworkPassphraseValidatorRule({ environment: 'test' });
    const violation = rule.evaluate({
      toolName: 'stellar_submit_transaction',
      params: { networkPassphrase: TESTNET_PASSPHRASE }
    });
    expect(violation).toBeNull();
  });

  it('blocks Pubnet passphrase when environment is test', () => {
    const rule = createStellarNetworkPassphraseValidatorRule({ environment: 'test' });
    const violation = rule.evaluate({
      toolName: 'stellar_submit_transaction',
      params: { networkPassphrase: PUBNET_PASSPHRASE }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('critical');
    expect(violation?.detectedPattern).toContain('MAINNET_ACCESS_IN_TEST_ENV');
  });

  it('enforces specific allowed passphrase', () => {
    const rule = createStellarNetworkPassphraseValidatorRule({ allowedNetworkPassphrase: TESTNET_PASSPHRASE });
    const violation = rule.evaluate({
      toolName: 'stellar_submit_transaction',
      params: { networkPassphrase: PUBNET_PASSPHRASE }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('NETWORK_PASSPHRASE_MISMATCH');
  });
});
