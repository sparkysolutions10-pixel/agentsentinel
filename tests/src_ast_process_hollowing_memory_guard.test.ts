import { describe, it, expect } from 'vitest';
import { ProcessHollowingMemoryGuard } from '../src/ast/process_hollowing_memory_guard.js';

describe('ProcessHollowingMemoryGuard Invariant Suite (#1895)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = ProcessHollowingMemoryGuard.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_PROCESS_HOLLOWING_MEMORY_GUARD');
    expect(ProcessHollowingMemoryGuard.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = ProcessHollowingMemoryGuard.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(ProcessHollowingMemoryGuard.validate('git status && npm run test')).toBe(true);
  });
});
