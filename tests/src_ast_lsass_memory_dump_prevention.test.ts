import { describe, it, expect } from 'vitest';
import { LsassMemoryDumpPrevention } from '../src/ast/lsass_memory_dump_prevention.js';

describe('LsassMemoryDumpPrevention Invariant Suite (#1897)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = LsassMemoryDumpPrevention.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_LSASS_MEMORY_DUMP_PREVENTION');
    expect(LsassMemoryDumpPrevention.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = LsassMemoryDumpPrevention.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(LsassMemoryDumpPrevention.validate('git status && npm run test')).toBe(true);
  });
});
