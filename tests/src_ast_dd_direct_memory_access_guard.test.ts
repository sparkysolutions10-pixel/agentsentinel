import { describe, it, expect } from 'vitest';
import { DdDirectMemoryAccessGuard } from '../src/ast/dd_direct_memory_access_guard.js';

describe('DdDirectMemoryAccessGuard Invariant Suite (#1875)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = DdDirectMemoryAccessGuard.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_DD_DIRECT_MEMORY_ACCESS_GUARD');
    expect(DdDirectMemoryAccessGuard.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = DdDirectMemoryAccessGuard.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(DdDirectMemoryAccessGuard.validate('git status && npm run test')).toBe(true);
  });
});
