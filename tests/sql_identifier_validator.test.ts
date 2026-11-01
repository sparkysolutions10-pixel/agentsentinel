import { describe, it, expect } from 'vitest';
import { SqlIdentifierValidator } from '../src/utils/sql_identifier_validator.js';

describe('SqlIdentifierValidator', () => {
  it('validates safe SQL identifiers', () => {
    expect(SqlIdentifierValidator.isValid('users')).toBe(true);
    expect(SqlIdentifierValidator.isValid('account_balances_2026')).toBe(true);
    expect(SqlIdentifierValidator.isValid('_internal_id')).toBe(true);
  });

  it('rejects dangerous injection vectors and reserved keywords', () => {
    expect(SqlIdentifierValidator.isValid('users; DROP TABLE users--')).toBe(false);
    expect(SqlIdentifierValidator.isValid('user-name')).toBe(false);
    expect(SqlIdentifierValidator.isValid('select')).toBe(false);
    expect(SqlIdentifierValidator.isValid('drop')).toBe(false);
  });

  it('escapes valid identifiers and throws on invalid ones', () => {
    expect(SqlIdentifierValidator.escape('audit_logs')).toBe('"audit_logs"');
    expect(() => SqlIdentifierValidator.escape('bad-name;')).toThrow();
  });
});
