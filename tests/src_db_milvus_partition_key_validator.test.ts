import { describe, it, expect } from 'vitest';
import { MilvusPartitionKeyValidator } from '../src/db/milvus_partition_key_validator.js';

describe('MilvusPartitionKeyValidator Invariant Suite (#1915)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = MilvusPartitionKeyValidator.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MILVUS_PARTITION_KEY_VALIDATOR');
    expect(MilvusPartitionKeyValidator.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = MilvusPartitionKeyValidator.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(MilvusPartitionKeyValidator.validate('git status && npm run test')).toBe(true);
  });
});
