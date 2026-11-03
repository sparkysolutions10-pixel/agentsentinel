import { describe, it, expect } from 'vitest';
import { ColdStoragePivotingFirewall } from '../src/web3/cold_storage_pivoting_firewall.js';

describe('ColdStoragePivotingFirewall Invariant Suite (#1766)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = ColdStoragePivotingFirewall.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_COLD_STORAGE_PIVOTING_FIREWALL');
    expect(ColdStoragePivotingFirewall.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = ColdStoragePivotingFirewall.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(ColdStoragePivotingFirewall.validate('git status && npm run test')).toBe(true);
  });
});
