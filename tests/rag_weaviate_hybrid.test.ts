import { describe, it, expect } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import { createWeaviateHybridValidatorRule } from '../src/rag/weaviate_hybrid_validator.js';
import { Verdict, ToolCallContext } from '../src/types.js';

describe('Weaviate Hybrid Validator (#327 & #328)', () => {
  const engine = new SentinelEngine();
  engine.registerRule(createWeaviateHybridValidatorRule());

  it('rejects out of bounds alpha values', async () => {
    const badCtx: ToolCallContext = {
      id: 'hyb_bad',
      toolName: 'weaviate_hybrid_search',
      params: { alpha: 2.5, query: 'test' },
      timestamp: Date.now()
    };
    const res = await engine.evaluate(badCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('Alpha must be a valid float between 0.0 and 1.0');
  });

  it('allows valid alpha weightings', async () => {
    const goodCtx: ToolCallContext = {
      id: 'hyb_good',
      toolName: 'weaviate_hybrid_search',
      params: { alpha: 0.75, query: 'test' },
      timestamp: Date.now()
    };
    const res = await engine.evaluate(goodCtx);
    expect(res.allowed).toBe(true);
    expect(res.verdict).toBe(Verdict.ALLOW);
  });
});
