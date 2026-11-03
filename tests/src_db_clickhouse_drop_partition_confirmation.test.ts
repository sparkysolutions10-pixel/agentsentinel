import { describe, it, expect } from 'vitest';
import { ClickhouseDropPartitionConfirmation } from '../src/db/clickhouse_drop_partition_confirmation.js';

describe('ClickhouseDropPartitionConfirmation Invariant Suite (#1935)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = ClickhouseDropPartitionConfirmation.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_CLICKHOUSE_DROP_PARTITION_CONFIRMATION');
    expect(ClickhouseDropPartitionConfirmation.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = ClickhouseDropPartitionConfirmation.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(ClickhouseDropPartitionConfirmation.validate('git status && npm run test')).toBe(true);
  });
});
