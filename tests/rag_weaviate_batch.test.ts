import { describe, it, expect } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import { createWeaviateBatchQuarantineRule } from '../src/rag/weaviate_batch_quarantine.js';
import { Verdict, ToolCallContext } from '../src/types.js';

describe('Weaviate Batch Quarantine (#331 & #332)', () => {
  const engine = new SentinelEngine();
  engine.registerRule(createWeaviateBatchQuarantineRule());

  it('blocks batch exceeding 1000 objects limit', async () => {
    const hugeObjs = Array.from({ length: 1050 }, (_, i) => ({ class: 'Article', id: i }));
    const batchCtx: ToolCallContext = {
      id: 'wb_1',
      toolName: 'weaviate_batch_insert',
      params: { objects: hugeObjs },
      timestamp: Date.now()
    };
    const res = await engine.evaluate(batchCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('exceeds safety limit of 1000');
  });

  it('allows safe compliant batch objects', async () => {
    const safeCtx: ToolCallContext = {
      id: 'wb_2',
      toolName: 'weaviate_batch_insert',
      params: { objects: [{ class: 'Article', properties: { title: 'Test' } }] },
      timestamp: Date.now()
    };
    const res = await engine.evaluate(safeCtx);
    expect(res.allowed).toBe(true);
    expect(res.verdict).toBe(Verdict.ALLOW);
  });
});
