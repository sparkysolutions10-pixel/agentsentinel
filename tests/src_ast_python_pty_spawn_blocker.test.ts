import { describe, it, expect } from 'vitest';
import { PythonPtySpawnBlocker } from '../src/ast/python_pty_spawn_blocker.js';

describe('PythonPtySpawnBlocker Invariant Suite (#1866)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = PythonPtySpawnBlocker.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_PYTHON_PTY_SPAWN_BLOCKER');
    expect(PythonPtySpawnBlocker.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = PythonPtySpawnBlocker.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(PythonPtySpawnBlocker.validate('git status && npm run test')).toBe(true);
  });
});
