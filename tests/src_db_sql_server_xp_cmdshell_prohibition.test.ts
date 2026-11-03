import { describe, it, expect } from 'vitest';
import { SqlServerXpCmdshellProhibition } from '../src/db/sql_server_xp_cmdshell_prohibition.js';

describe('SqlServerXpCmdshellProhibition Invariant Suite (#1940)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = SqlServerXpCmdshellProhibition.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_SQL_SERVER_XP_CMDSHELL_PROHIBITION');
    expect(SqlServerXpCmdshellProhibition.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = SqlServerXpCmdshellProhibition.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(SqlServerXpCmdshellProhibition.validate('git status && npm run test')).toBe(true);
  });
});
