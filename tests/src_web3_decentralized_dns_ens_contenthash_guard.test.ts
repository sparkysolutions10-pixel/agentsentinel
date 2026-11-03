import { describe, it, expect } from 'vitest';
import { DecentralizedDnsEnsContenthashGuard } from '../src/web3/decentralized_dns_ens_contenthash_guard.js';

describe('DecentralizedDnsEnsContenthashGuard Invariant Suite (#1798)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = DecentralizedDnsEnsContenthashGuard.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_DECENTRALIZED_DNS_ENS_CONTENTHASH_GUARD');
    expect(DecentralizedDnsEnsContenthashGuard.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = DecentralizedDnsEnsContenthashGuard.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(DecentralizedDnsEnsContenthashGuard.validate('git status && npm run test')).toBe(true);
  });
});
