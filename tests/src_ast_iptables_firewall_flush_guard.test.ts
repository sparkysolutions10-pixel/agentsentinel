import { describe, it, expect } from 'vitest';
import { IptablesFirewallFlushGuard } from '../src/ast/iptables_firewall_flush_guard.js';

describe('IptablesFirewallFlushGuard Invariant Suite (#1871)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = IptablesFirewallFlushGuard.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_IPTABLES_FIREWALL_FLUSH_GUARD');
    expect(IptablesFirewallFlushGuard.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = IptablesFirewallFlushGuard.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(IptablesFirewallFlushGuard.validate('git status && npm run test')).toBe(true);
  });
});
