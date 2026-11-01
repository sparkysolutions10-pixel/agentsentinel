import { describe, it, expect } from 'vitest';
import { createZeroTrustVectorPolicyRule } from '../src/rag/zero_trust_vector_policy.js';
import { Verdict } from '../src/types.js';

describe('ZeroTrustVectorPolicy', () => {
  const rule = createZeroTrustVectorPolicyRule();

  it('allows admin role to access restricted collection', () => {
    const violation = rule.evaluate({ toolName: 'vquery', params: { collection: 'admin_knowledge', callerRole: 'admin' } });
    expect(violation).toBeNull();
  });

  it('blocks anonymous access to restricted collection', () => {
    const violation = rule.evaluate({ toolName: 'vquery', params: { collection: 'admin_knowledge' } });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });
});
