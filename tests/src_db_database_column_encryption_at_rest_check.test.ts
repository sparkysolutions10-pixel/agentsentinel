import { describe, it, expect } from 'vitest';
import { DatabaseColumnEncryptionAtRestCheck } from '../src/db/database_column_encryption_at_rest_check.js';

describe('DatabaseColumnEncryptionAtRestCheck Invariant Suite (#1953)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = DatabaseColumnEncryptionAtRestCheck.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_DATABASE_COLUMN_ENCRYPTION_AT_REST_CHECK');
    expect(DatabaseColumnEncryptionAtRestCheck.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = DatabaseColumnEncryptionAtRestCheck.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(DatabaseColumnEncryptionAtRestCheck.validate('git status && npm run test')).toBe(true);
  });
});
