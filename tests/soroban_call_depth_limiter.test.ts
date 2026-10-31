import { describe, it, expect } from 'vitest';
import { createSorobanCallDepthLimiterRule } from '../src/web3/soroban_call_depth_limiter.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Soroban Invocation Call Depth Limiter (#907, #908)', () => {
  const rule = createSorobanCallDepthLimiterRule({ maxCallDepth: 5 });

  it('allows cross-contract calls within acceptable depth threshold', () => {
    const ctx: ToolCallContext = {
      id: 'call-depth-ok-1',
      toolName: 'soroban_invoke',
      params: {
        contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
        callDepth: 3,
      },
      timestamp: Date.now(),
    };
    expect(rule.evaluate(ctx)).toBeNull();
  });

  it('blocks invocations exceeding maximum call depth limit (#908)', () => {
    const ctx: ToolCallContext = {
      id: 'call-depth-exceeded-1',
      toolName: 'soroban_invoke',
      params: {
        contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
        callDepth: 7, // 7 > 5
      },
      timestamp: Date.now(),
    };
    const violation = rule.evaluate(ctx);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.reason).toContain('exceeds maximum allowed limit');
  });

  it('computes nested invocation tree depth correctly', () => {
    const ctx: ToolCallContext = {
      id: 'call-depth-tree-1',
      toolName: 'soroban_invoke',
      params: {
        invocation: {
          subInvocations: [
            {
              subInvocations: [
                {
                  subInvocations: [
                    {
                      subInvocations: [
                        {
                          subInvocations: [
                            {} // depth = 6 > 5
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      },
      timestamp: Date.now(),
    };
    const violation = rule.evaluate(ctx);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });
});
