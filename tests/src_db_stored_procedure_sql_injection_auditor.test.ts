import { describe, it, expect } from 'vitest';
import { StoredProcedureSqlInjectionAuditor } from '../src/db/stored_procedure_sql_injection_auditor.js';

describe('StoredProcedureSqlInjectionAuditor Invariant Suite (#1930)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = StoredProcedureSqlInjectionAuditor.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_STORED_PROCEDURE_SQL_INJECTION_AUDITOR');
    expect(StoredProcedureSqlInjectionAuditor.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = StoredProcedureSqlInjectionAuditor.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(StoredProcedureSqlInjectionAuditor.validate('git status && npm run test')).toBe(true);
  });
});
