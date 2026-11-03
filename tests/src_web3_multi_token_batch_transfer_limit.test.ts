import { describe, it, expect } from 'vitest';
import { MultiTokenBatchTransferLimit } from '../src/web3/multi_token_batch_transfer_limit.js';

describe('MultiTokenBatchTransferLimit Invariant Suite (#1794)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = MultiTokenBatchTransferLimit.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MULTI_TOKEN_BATCH_TRANSFER_LIMIT');
    expect(MultiTokenBatchTransferLimit.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = MultiTokenBatchTransferLimit.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(MultiTokenBatchTransferLimit.validate('git status && npm run test')).toBe(true);
  });
});
