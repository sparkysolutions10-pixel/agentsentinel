import { describe, it, expect } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import { createQdrantSnapshotGuardRule } from '../src/rag/qdrant_snapshot_guard.js';
import { Verdict, ToolCallContext } from '../src/types.js';

describe('Qdrant Snapshot Guard (#307 & #308)', () => {
  const engine = new SentinelEngine();
  engine.registerRule(createQdrantSnapshotGuardRule());

  it('blocks unauthorized snapshot creation dump', async () => {
    const dumpCtx: ToolCallContext = {
      id: 'snap_dump_1',
      toolName: 'qdrant_create_snapshot',
      params: {
        collection_name: 'sensitive_embeddings',
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(dumpCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('Unauthorized collection snapshot creation or exfiltration');
  });

  it('blocks unauthorized collection snapshot download', async () => {
    const dlCtx: ToolCallContext = {
      id: 'snap_dl_1',
      toolName: 'download_snapshot',
      params: {
        snapshot_name: 'dump.snapshot',
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(dlCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
  });

  it('allows authorized standard collection read queries', async () => {
    const safeCtx: ToolCallContext = {
      id: 'snap_safe_1',
      toolName: 'get_collection_info',
      params: {
        collection_name: 'public_data',
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(safeCtx);
    expect(res.allowed).toBe(true);
    expect(res.verdict).toBe(Verdict.ALLOW);
  });
});
