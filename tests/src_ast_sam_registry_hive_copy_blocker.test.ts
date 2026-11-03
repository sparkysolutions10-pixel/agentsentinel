import { describe, it, expect } from 'vitest';
import { SamRegistryHiveCopyBlocker } from '../src/ast/sam_registry_hive_copy_blocker.js';

describe('SamRegistryHiveCopyBlocker Invariant Suite (#1898)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = SamRegistryHiveCopyBlocker.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_SAM_REGISTRY_HIVE_COPY_BLOCKER');
    expect(SamRegistryHiveCopyBlocker.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = SamRegistryHiveCopyBlocker.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(SamRegistryHiveCopyBlocker.validate('git status && npm run test')).toBe(true);
  });
});
