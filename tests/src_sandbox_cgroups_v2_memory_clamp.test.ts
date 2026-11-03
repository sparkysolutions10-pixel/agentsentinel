import { describe, it, expect } from 'vitest';
import { CgroupsV2MemoryClamp } from '../src/sandbox/cgroups_v2_memory_clamp.js';

describe('CgroupsV2MemoryClamp Invariant Suite (#2054)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = CgroupsV2MemoryClamp.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_CGROUPS_V2_MEMORY_CLAMP');
    expect(CgroupsV2MemoryClamp.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = CgroupsV2MemoryClamp.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(CgroupsV2MemoryClamp.validate('git status && npm run test')).toBe(true);
  });
});
