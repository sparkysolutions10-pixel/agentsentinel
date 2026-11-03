import { describe, it, expect } from 'vitest';
import { SanctionsOfacSdnListMatcher } from '../src/fintech/sanctions_ofac_sdn_list_matcher.js';

describe('SanctionsOfacSdnListMatcher Invariant Suite (#1976)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = SanctionsOfacSdnListMatcher.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_SANCTIONS_OFAC_SDN_LIST_MATCHER');
    expect(SanctionsOfacSdnListMatcher.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = SanctionsOfacSdnListMatcher.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(SanctionsOfacSdnListMatcher.validate('git status && npm run test')).toBe(true);
  });
});
