import { describe, it, expect } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import { createWeaviateSchemaProtectorRule } from '../src/rag/weaviate_schema_protector.js';
import { Verdict, ToolCallContext } from '../src/types.js';

describe('Weaviate Schema Protector (#329 & #330)', () => {
  const engine = new SentinelEngine();
  engine.registerRule(createWeaviateSchemaProtectorRule());

  it('blocks bulk schema dump operations', async () => {
    const dumpCtx: ToolCallContext = {
      id: 'sch_1',
      toolName: 'weaviate_dump_schema',
      params: {},
      timestamp: Date.now()
    };
    const res = await engine.evaluate(dumpCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('Unauthorized bulk schema extraction');
  });

  it('allows safe query execution', async () => {
    const safeCtx: ToolCallContext = {
      id: 'sch_2',
      toolName: 'weaviate_search',
      params: { query: 'test' },
      timestamp: Date.now()
    };
    const res = await engine.evaluate(safeCtx);
    expect(res.allowed).toBe(true);
    expect(res.verdict).toBe(Verdict.ALLOW);
  });
});
