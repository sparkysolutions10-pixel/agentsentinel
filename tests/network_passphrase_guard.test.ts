import { describe, it, expect } from 'vitest';
import { createNetworkPassphraseRule, STELLAR_TESTNET_PASSPHRASE, STELLAR_MAINNET_PASSPHRASE } from '../src/web3/network_passphrase_guard.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('StellarNetworkPassphraseGuard', () => {
  const rule = createNetworkPassphraseRule({ allowedNetwork: 'testnet' });

  it('allows transactions matching the configured network passphrase', () => {
    const context: ToolCallContext = {
      id: 'tx_passphrase_valid',
      toolName: 'stellar_submit_transaction',
      params: { networkPassphrase: STELLAR_TESTNET_PASSPHRASE },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).toBeNull();
  });

  it('blocks testnet agent from executing transaction using Mainnet passphrase', () => {
    const context: ToolCallContext = {
      id: 'tx_passphrase_accidental_mainnet',
      toolName: 'stellar_submit_transaction',
      params: { networkPassphrase: STELLAR_MAINNET_PASSPHRASE },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('critical');
    expect(violation?.detectedPattern).toContain('PASSPHRASE_MISMATCH');
  });
});
