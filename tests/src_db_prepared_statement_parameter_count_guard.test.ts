import { describe, it, expect } from 'vitest';
import { PreparedStatementParameterCountGuard } from '../src/db/prepared_statement_parameter_count_guard.js';

describe('PreparedStatementParameterCountGuard Invariant Suite (#1927)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = PreparedStatementParameterCountGuard.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_PREPARED_STATEMENT_PARAMETER_COUNT_GUARD');
    expect(PreparedStatementParameterCountGuard.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = PreparedStatementParameterCountGuard.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(PreparedStatementParameterCountGuard.validate('git status && npm run test')).toBe(true);
  });
});
