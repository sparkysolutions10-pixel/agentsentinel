import { describe, it, expect } from 'vitest';
import { CryptoAgilityRuntimePluggableRegistry } from '../src/crypto/crypto_agility_runtime_pluggable_registry.js';

describe('CryptoAgilityRuntimePluggableRegistry Invariant Suite (#2053)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = CryptoAgilityRuntimePluggableRegistry.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_CRYPTO_AGILITY_RUNTIME_PLUGGABLE_REGISTRY');
    expect(CryptoAgilityRuntimePluggableRegistry.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = CryptoAgilityRuntimePluggableRegistry.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(CryptoAgilityRuntimePluggableRegistry.validate('git status && npm run test')).toBe(true);
  });
});
