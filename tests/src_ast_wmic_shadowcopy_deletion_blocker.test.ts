import { describe, it, expect } from 'vitest';
import { WmicShadowcopyDeletionBlocker } from '../src/ast/wmic_shadowcopy_deletion_blocker.js';

describe('WmicShadowcopyDeletionBlocker Invariant Suite (#1888)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = WmicShadowcopyDeletionBlocker.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_WMIC_SHADOWCOPY_DELETION_BLOCKER');
    expect(WmicShadowcopyDeletionBlocker.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = WmicShadowcopyDeletionBlocker.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(WmicShadowcopyDeletionBlocker.validate('git status && npm run test')).toBe(true);
  });
});
