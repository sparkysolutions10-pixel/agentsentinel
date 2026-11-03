import { describe, it, expect } from 'vitest';
import { SmartWalletSessionKeyExpiry } from '../src/web3/smart_wallet_session_key_expiry.js';

describe('SmartWalletSessionKeyExpiry Invariant Suite (#1797)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = SmartWalletSessionKeyExpiry.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_SMART_WALLET_SESSION_KEY_EXPIRY');
    expect(SmartWalletSessionKeyExpiry.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = SmartWalletSessionKeyExpiry.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(SmartWalletSessionKeyExpiry.validate('git status && npm run test')).toBe(true);
  });
});
