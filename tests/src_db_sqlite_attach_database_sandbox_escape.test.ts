import { describe, it, expect } from 'vitest';
import { SqliteAttachDatabaseSandboxEscape } from '../src/db/sqlite_attach_database_sandbox_escape.js';

describe('SqliteAttachDatabaseSandboxEscape Invariant Suite (#1936)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = SqliteAttachDatabaseSandboxEscape.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_SQLITE_ATTACH_DATABASE_SANDBOX_ESCAPE');
    expect(SqliteAttachDatabaseSandboxEscape.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = SqliteAttachDatabaseSandboxEscape.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(SqliteAttachDatabaseSandboxEscape.validate('git status && npm run test')).toBe(true);
  });
});
