import { describe, it, expect } from 'vitest';
import { createSorobanAuthTreeVerifierRule } from '../src/web3/soroban_auth_tree.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Soroban Authorization Tree Verifier (#897, #898)', () => {
  const rule = createSorobanAuthTreeVerifierRule({
    maxAuthTreeDepth: 4,
    disallowUnsignedSubInvocations: true,
  });

  it('allows verified authorization tree with valid credentials', () => {
    const ctx: ToolCallContext = {
      id: 'auth-tree-ok-1',
      toolName: 'soroban_invoke',
      params: {
        contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
        auth: [
          {
            credentials: { type: 'source_account', address: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5' },
            subInvocations: [
              {
                credentials: { signature: 'sig_valid_123', address: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5' },
              }
            ]
          }
        ]
      },
      timestamp: Date.now(),
    };

    const violation = rule.evaluate(ctx);
    expect(violation).toBeNull();
  });

  it('blocks unauthorized sub-invocation tree leaves (#898)', () => {
    const ctx: ToolCallContext = {
      id: 'auth-tree-unsigned-leaf-1',
      toolName: 'soroban_invoke',
      params: {
        contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
        auth: [
          {
            credentials: { type: 'source_account' },
            subInvocations: [
              {
                function: 'malicious_drain',
                // Missing credentials completely
              }
            ]
          }
        ]
      },
      timestamp: Date.now(),
    };

    const violation = rule.evaluate(ctx);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.reason).toContain('Missing authorization credentials for invocation node');
  });

  it('blocks authorization tree exceeding max invocation depth', () => {
    const ctx: ToolCallContext = {
      id: 'auth-tree-depth-exceeded-1',
      toolName: 'soroban_invoke',
      params: {
        auth: [
          {
            credentials: { type: 'source_account' },
            subInvocations: [
              {
                credentials: { type: 'source_account' },
                subInvocations: [
                  {
                    credentials: { type: 'source_account' },
                    subInvocations: [
                      {
                        credentials: { type: 'source_account' },
                        subInvocations: [
                          {
                            credentials: { type: 'source_account' } // depth 5 > 4
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      timestamp: Date.now(),
    };

    const violation = rule.evaluate(ctx);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.reason).toContain('exceeds maximum limit');
  });
});
