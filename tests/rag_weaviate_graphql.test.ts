import { describe, it, expect } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import { createWeaviateGraphQLLimiterRule } from '../src/rag/weaviate_graphql_limiter.js';
import { Verdict, ToolCallContext } from '../src/types.js';

describe('Weaviate GraphQL Limiter (#325 & #326)', () => {
  const engine = new SentinelEngine();
  engine.registerRule(createWeaviateGraphQLLimiterRule(5));

  it('halts circular object traversal with excessive query depth', async () => {
    const deepQuery = '{ Get { Articles { author { articles { author { articles { title } } } } } } }';
    const deepCtx: ToolCallContext = {
      id: 'gql_deep',
      toolName: 'weaviate_graphql',
      params: { query: deepQuery },
      timestamp: Date.now()
    };
    const res = await engine.evaluate(deepCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('exceeds maximum limit of 5');
  });

  it('allows compliant shallow GraphQL queries', async () => {
    const safeCtx: ToolCallContext = {
      id: 'gql_safe',
      toolName: 'weaviate_graphql',
      params: { query: '{ Get { Articles { title } } }' },
      timestamp: Date.now()
    };
    const res = await engine.evaluate(safeCtx);
    expect(res.allowed).toBe(true);
    expect(res.verdict).toBe(Verdict.ALLOW);
  });
});
