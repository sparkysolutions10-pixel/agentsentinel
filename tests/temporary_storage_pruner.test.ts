import { describe, it, expect } from 'vitest';
import { createTemporaryStoragePrunerRule } from '../src/web3/temporary_storage_pruner.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('TemporaryStorageAutoPruner', () => {
  const rule = createTemporaryStoragePrunerRule();

  it('allows ephemeral cache keys in temporary storage', () => {
    const context: ToolCallContext = {
      id: 'tx_cache_key',
      toolName: 'soroban_set_storage',
      params: { storageType: 'temporary', key: 'price_feed_cache_123' },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).toBeNull();
  });

  it('blocks writing balance key to temporary storage', () => {
    const context: ToolCallContext = {
      id: 'tx_balance_in_temp',
      toolName: 'soroban_set_storage',
      params: { storageType: 'temporary', key: 'user_balance_GBBD67' },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('CRITICAL_KEY_IN_TEMPORARY_STORAGE');
  });
});
