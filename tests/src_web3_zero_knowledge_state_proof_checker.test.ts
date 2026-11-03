import { describe, it, expect } from 'vitest';
import { ZeroKnowledgeStateProofChecker } from '../src/web3/zero_knowledge_state_proof_checker.js';

describe('ZeroKnowledgeStateProofChecker Invariant Suite (#1763)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = ZeroKnowledgeStateProofChecker.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_ZERO_KNOWLEDGE_STATE_PROOF_CHECKER');
    expect(ZeroKnowledgeStateProofChecker.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = ZeroKnowledgeStateProofChecker.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(ZeroKnowledgeStateProofChecker.validate('git status && npm run test')).toBe(true);
  });
});
