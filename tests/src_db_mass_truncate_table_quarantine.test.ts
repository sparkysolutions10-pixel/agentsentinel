import { describe, it, expect } from 'vitest';
import { MassTruncateTableQuarantine } from '../src/db/mass_truncate_table_quarantine.js';

describe('MassTruncateTableQuarantine Invariant Suite (#1905)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = MassTruncateTableQuarantine.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MASS_TRUNCATE_TABLE_QUARANTINE');
    expect(MassTruncateTableQuarantine.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = MassTruncateTableQuarantine.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(MassTruncateTableQuarantine.validate('git status && npm run test')).toBe(true);
  });
});
