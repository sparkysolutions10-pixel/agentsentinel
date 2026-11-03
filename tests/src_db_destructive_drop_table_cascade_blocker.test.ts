import { describe, it, expect } from 'vitest';
import { DestructiveDropTableCascadeBlocker } from '../src/db/destructive_drop_table_cascade_blocker.js';

describe('DestructiveDropTableCascadeBlocker Invariant Suite (#1904)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = DestructiveDropTableCascadeBlocker.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_DESTRUCTIVE_DROP_TABLE_CASCADE_BLOCKER');
    expect(DestructiveDropTableCascadeBlocker.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = DestructiveDropTableCascadeBlocker.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(DestructiveDropTableCascadeBlocker.validate('git status && npm run test')).toBe(true);
  });
});
