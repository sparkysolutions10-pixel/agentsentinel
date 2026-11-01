import { describe, it, expect } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import { createQdrantGrpcPayloadLimiterRule } from '../src/rag/qdrant_grpc_limiter.js';
import { Verdict, ToolCallContext } from '../src/types.js';

describe('Qdrant gRPC Payload Limiter (#313 & #314)', () => {
  const engine = new SentinelEngine();
  engine.registerRule(createQdrantGrpcPayloadLimiterRule({ maxFrameSizeBytes: 1024 * 1024 }));

  it('blocks oversized gRPC message frame payloads', async () => {
    const hugeCtx: ToolCallContext = {
      id: 'grpc_1',
      toolName: 'qdrant_grpc_stream',
      params: { protocol: 'grpc', payload: 'x'.repeat(2 * 1024 * 1024) },
      timestamp: Date.now()
    };
    const res = await engine.evaluate(hugeCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('exceeds maximum allowable ceiling');
  });

  it('allows compliant gRPC payloads', async () => {
    const safeCtx: ToolCallContext = {
      id: 'grpc_2',
      toolName: 'qdrant_grpc_query',
      params: { protocol: 'grpc', payload: 'small test query' },
      timestamp: Date.now()
    };
    const res = await engine.evaluate(safeCtx);
    expect(res.allowed).toBe(true);
    expect(res.verdict).toBe(Verdict.ALLOW);
  });
});
