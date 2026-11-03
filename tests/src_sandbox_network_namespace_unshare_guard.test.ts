import { describe, it, expect } from 'vitest';
import { NetworkNamespaceUnshareGuard } from '../src/sandbox/network_namespace_unshare_guard.js';

describe('NetworkNamespaceUnshareGuard Invariant Suite (#2057)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = NetworkNamespaceUnshareGuard.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_NETWORK_NAMESPACE_UNSHARE_GUARD');
    expect(NetworkNamespaceUnshareGuard.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = NetworkNamespaceUnshareGuard.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(NetworkNamespaceUnshareGuard.validate('git status && npm run test')).toBe(true);
  });
});
