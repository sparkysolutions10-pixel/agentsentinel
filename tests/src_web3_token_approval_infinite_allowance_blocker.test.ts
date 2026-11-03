import { describe, it, expect } from 'vitest';
import { TokenApprovalInfiniteAllowanceBlocker } from '../src/web3/token_approval_infinite_allowance_blocker.js';

describe('TokenApprovalInfiniteAllowanceBlocker Invariant Suite (#1770)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = TokenApprovalInfiniteAllowanceBlocker.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_TOKEN_APPROVAL_INFINITE_ALLOWANCE_BLOCKER');
    expect(TokenApprovalInfiniteAllowanceBlocker.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = TokenApprovalInfiniteAllowanceBlocker.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(TokenApprovalInfiniteAllowanceBlocker.validate('git status && npm run test')).toBe(true);
  });
});
