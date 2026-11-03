import { describe, it, expect } from 'vitest';
import { SubgraphGraphqlDepthLimiter } from '../src/web3/subgraph_graphql_depth_limiter.js';

describe('SubgraphGraphqlDepthLimiter Invariant Suite (#1792)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = SubgraphGraphqlDepthLimiter.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_SUBGRAPH_GRAPHQL_DEPTH_LIMITER');
    expect(SubgraphGraphqlDepthLimiter.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = SubgraphGraphqlDepthLimiter.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(SubgraphGraphqlDepthLimiter.validate('git status && npm run test')).toBe(true);
  });
});
