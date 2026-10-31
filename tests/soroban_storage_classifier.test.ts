import { describe, it, expect } from 'vitest';
import { createSorobanStorageClassifierRule } from '../src/web3/soroban_storage_classifier.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Soroban Storage Classification Filter (#895, #896)', () => {
  const rule = createSorobanStorageClassifierRule();

  it('allows transient keys when targeted for Temporary storage (#896)', () => {
    const ctx: ToolCallContext = {
      id: 'storage-temp-ok-1',
      toolName: 'soroban_invoke',
      params: {
        storageType: 'temporary',
        key: 'session_auth_token_99182',
      },
      timestamp: Date.now(),
    };

    const violation = rule.evaluate(ctx);
    expect(violation).toBeNull();
  });

  it('allows non-transient balance or config keys in Persistent storage', () => {
    const ctx: ToolCallContext = {
      id: 'storage-persistent-ok-1',
      toolName: 'soroban_invoke',
      params: {
        storageType: 'persistent',
        key: 'ACCOUNT_BALANCE_USDC_100',
      },
      timestamp: Date.now(),
    };

    const violation = rule.evaluate(ctx);
    expect(violation).toBeNull();
  });

  it('blocks transient session facts targeted for Persistent storage', () => {
    const ctx: ToolCallContext = {
      id: 'storage-transient-persistent-1',
      toolName: 'soroban_invoke',
      params: {
        storageType: 'persistent',
        key: 'ephemeral_nonce_challenge_123',
      },
      timestamp: Date.now(),
    };

    const violation = rule.evaluate(ctx);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.reason).toContain('Use Temporary storage to prevent permanent ledger rent bloat');
  });
});
