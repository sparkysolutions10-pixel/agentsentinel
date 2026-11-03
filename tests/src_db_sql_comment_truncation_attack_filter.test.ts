import { describe, it, expect } from 'vitest';
import { SqlCommentTruncationAttackFilter } from '../src/db/sql_comment_truncation_attack_filter.js';

describe('SqlCommentTruncationAttackFilter Invariant Suite (#1908)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = SqlCommentTruncationAttackFilter.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_SQL_COMMENT_TRUNCATION_ATTACK_FILTER');
    expect(SqlCommentTruncationAttackFilter.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = SqlCommentTruncationAttackFilter.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(SqlCommentTruncationAttackFilter.validate('git status && npm run test')).toBe(true);
  });
});
