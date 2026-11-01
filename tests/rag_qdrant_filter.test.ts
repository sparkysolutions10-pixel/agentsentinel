import { describe, it, expect } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import { createQdrantFilterValidatorRule } from '../src/rag/qdrant_filter_validator.js';
import { Verdict, ToolCallContext } from '../src/types.js';

describe('Qdrant Search Payload Filter Validator (#305 & #306)', () => {
  const engine = new SentinelEngine();
  engine.registerRule(createQdrantFilterValidatorRule({ maxFilterDepth: 5 }));

  it('blocks deeply recursive filter conditions exceeding max depth', async () => {
    let deepFilter: any = { key: 'val' };
    for (let i = 0; i < 8; i++) {
      deepFilter = { must: [deepFilter] };
    }

    const recursiveCtx: ToolCallContext = {
      id: 'qdrant_rec_1',
      toolName: 'qdrant_search',
      params: {
        filter: deepFilter,
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(recursiveCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('exceeds maximum allowable depth');
  });

  it('blocks prototype pollution in filter keys', async () => {
    const protoPayload = JSON.parse('{"__proto__": {"admin": true}}');
    const protoCtx: ToolCallContext = {
      id: 'qdrant_proto_1',
      toolName: 'qdrant_search',
      params: {
        filter: protoPayload,
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(protoCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('Prototype pollution attempt detected');
  });

  it('allows standard legitimate key-value filters', async () => {
    const safeCtx: ToolCallContext = {
      id: 'qdrant_safe_1',
      toolName: 'qdrant_search',
      params: {
        filter: {
          must: [
            { key: 'city', match: { value: 'Berlin' } },
            { key: 'price', range: { lte: 100 } },
          ],
        },
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(safeCtx);
    expect(res.allowed).toBe(true);
    expect(res.verdict).toBe(Verdict.ALLOW);
  });
});
