import { describe, it, expect } from 'vitest';
import { FindExecSubcommandSpawner } from '../src/ast/find_exec_subcommand_spawner.js';

describe('FindExecSubcommandSpawner Invariant Suite (#1882)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = FindExecSubcommandSpawner.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_FIND_EXEC_SUBCOMMAND_SPAWNER');
    expect(FindExecSubcommandSpawner.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = FindExecSubcommandSpawner.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(FindExecSubcommandSpawner.validate('git status && npm run test')).toBe(true);
  });
});
