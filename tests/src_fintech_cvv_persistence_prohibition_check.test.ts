import { describe, it, expect } from 'vitest';
import { CvvPersistenceProhibitionCheck } from '../src/fintech/cvv_persistence_prohibition_check.js';

describe('CvvPersistenceProhibitionCheck Invariant Suite (#1961)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = CvvPersistenceProhibitionCheck.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_CVV_PERSISTENCE_PROHIBITION_CHECK');
    expect(CvvPersistenceProhibitionCheck.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = CvvPersistenceProhibitionCheck.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(CvvPersistenceProhibitionCheck.validate('git status && npm run test')).toBe(true);
  });
});
