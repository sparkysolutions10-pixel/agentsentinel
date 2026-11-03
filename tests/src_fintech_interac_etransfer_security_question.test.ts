import { describe, it, expect } from 'vitest';
import { InteracEtransferSecurityQuestion } from '../src/fintech/interac_etransfer_security_question.js';

describe('InteracEtransferSecurityQuestion Invariant Suite (#1982)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = InteracEtransferSecurityQuestion.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_INTERAC_ETRANSFER_SECURITY_QUESTION');
    expect(InteracEtransferSecurityQuestion.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = InteracEtransferSecurityQuestion.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(InteracEtransferSecurityQuestion.validate('git status && npm run test')).toBe(true);
  });
});
