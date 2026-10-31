import { describe, it, expect } from 'vitest';
import { createSorobanAuditProofAnchorRule } from '../src/web3/soroban_audit_anchor.js';
import { Verdict } from '../src/types.js';

describe('SorobanAuditProofAnchorRule', () => {
  const validHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

  it('allows verified audit proof with matching anchor hash', () => {
    const rule = createSorobanAuditProofAnchorRule();
    const violation = rule.evaluate({
      toolName: 'soroban_audit_anchor_log',
      params: { auditHash: validHash, memo: 'e3b0c44298fc1c14' }
    });
    expect(violation).toBeNull();
  });

  it('blocks audit anchoring when hash is missing', () => {
    const rule = createSorobanAuditProofAnchorRule();
    const violation = rule.evaluate({
      toolName: 'soroban_audit_anchor_log',
      params: { auditHash: '' }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('MISSING_AUDIT_HASH');
  });

  it('blocks audit proof when memo hash does not match state root', () => {
    const rule = createSorobanAuditProofAnchorRule();
    const violation = rule.evaluate({
      toolName: 'soroban_audit_anchor_log',
      params: { auditHash: validHash, memo: 'forged_memo_hash' }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('critical');
    expect(violation?.detectedPattern).toContain('AUDIT_PROOF_MISMATCH');
  });
});
