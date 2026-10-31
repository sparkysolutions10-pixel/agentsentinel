import { describe, it, expect } from 'vitest';
import { createSorobanAllowanceRevokeGuardRule } from '../src/web3/soroban_allowance_guard.js';
import { Verdict } from '../src/types.js';

describe('SorobanAllowanceRevokeGuardRule', () => {
  it('allows safe, bounded allowance requests', () => {
    const rule = createSorobanAllowanceRevokeGuardRule({ maxAllowedApproval: 5000 });
    const violation = rule.evaluate({
      toolName: 'soroban_token_approve',
      params: { spender: 'GCXYZ...', amount: 1000, currentLedger: 500, liveUntilLedger: 1500 }
    });
    expect(violation).toBeNull();
  });

  it('blocks unlimited u128::MAX approval requests', () => {
    const rule = createSorobanAllowanceRevokeGuardRule();
    const violation = rule.evaluate({
      toolName: 'soroban_token_approve',
      params: { spender: 'GCXYZ...', amount: '340282366920938463463374607431768211455' }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('UNLIMITED_APPROVAL_REQUEST');
  });

  it('blocks approval requests exceeding max allowed duration', () => {
    const rule = createSorobanAllowanceRevokeGuardRule({ maxExpirationLedgers: 1000 });
    const violation = rule.evaluate({
      toolName: 'soroban_token_approve',
      params: { spender: 'GCXYZ...', amount: 100, currentLedger: 100, liveUntilLedger: 2500 }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('EXCESSIVE_EXPIRATION_DURATION');
  });
});
