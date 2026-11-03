import { describe, it, expect } from 'vitest';
import { SqlInClauseCardinalityClamp } from '../src/db/sql_in_clause_cardinality_clamp.js';

describe('SqlInClauseCardinalityClamp Invariant Suite (#1947)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = SqlInClauseCardinalityClamp.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_SQL_IN_CLAUSE_CARDINALITY_CLAMP');
    expect(SqlInClauseCardinalityClamp.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = SqlInClauseCardinalityClamp.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(SqlInClauseCardinalityClamp.validate('git status && npm run test')).toBe(true);
  });
});
