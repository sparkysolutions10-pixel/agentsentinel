import { describe, it, expect } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import { createMilvusPartitionKeyEnforcerRule } from '../src/rag/milvus_partition_enforcer.js';
import { Verdict, ToolCallContext } from '../src/types.js';

describe('Milvus Partition Key Enforcer (#315 & #316)', () => {
  const engine = new SentinelEngine();
  engine.registerRule(createMilvusPartitionKeyEnforcerRule());

  it('blocks unpartitioned cross-tenant queries', async () => {
    const unpartitionedCtx: ToolCallContext = {
      id: 'milvus_1',
      toolName: 'milvus_search',
      params: { collection: 'enterprise_vectors', query: [0.1, 0.2] },
      timestamp: Date.now()
    };
    const res = await engine.evaluate(unpartitionedCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('must explicitly specify a partition key');
  });

  it('allows queries targeting an isolated partition', async () => {
    const partitionedCtx: ToolCallContext = {
      id: 'milvus_2',
      toolName: 'milvus_search',
      params: { collection: 'enterprise_vectors', partition_name: 'tenant_omega_44', query: [0.1, 0.2] },
      timestamp: Date.now()
    };
    const res = await engine.evaluate(partitionedCtx);
    expect(res.allowed).toBe(true);
    expect(res.verdict).toBe(Verdict.ALLOW);
  });
});
