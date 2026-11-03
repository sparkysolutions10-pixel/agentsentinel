import { describe, it, expect } from 'vitest';
import { CoreDumpUnredactedMemoryBlocker } from '../src/ast/core_dump_unredacted_memory_blocker.js';

describe('CoreDumpUnredactedMemoryBlocker Invariant Suite (#1881)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = CoreDumpUnredactedMemoryBlocker.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_CORE_DUMP_UNREDACTED_MEMORY_BLOCKER');
    expect(CoreDumpUnredactedMemoryBlocker.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = CoreDumpUnredactedMemoryBlocker.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(CoreDumpUnredactedMemoryBlocker.validate('git status && npm run test')).toBe(true);
  });
});
