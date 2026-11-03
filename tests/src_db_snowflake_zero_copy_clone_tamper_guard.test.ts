import { describe, it, expect } from 'vitest';
import { SnowflakeZeroCopyCloneTamperGuard } from '../src/db/snowflake_zero_copy_clone_tamper_guard.js';

describe('SnowflakeZeroCopyCloneTamperGuard Invariant Suite (#1933)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = SnowflakeZeroCopyCloneTamperGuard.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_SNOWFLAKE_ZERO_COPY_CLONE_TAMPER_GUARD');
    expect(SnowflakeZeroCopyCloneTamperGuard.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = SnowflakeZeroCopyCloneTamperGuard.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(SnowflakeZeroCopyCloneTamperGuard.validate('git status && npm run test')).toBe(true);
  });
});
