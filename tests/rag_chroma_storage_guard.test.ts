import { describe, it, expect } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import { createChromaStorageDirectoryGuardRule } from '../src/rag/chroma_storage_guard.js';
import { Verdict, ToolCallContext } from '../src/types.js';

describe('ChromaDB Local Storage Protector (#303 & #304)', () => {
  const engine = new SentinelEngine();
  engine.registerRule(createChromaStorageDirectoryGuardRule());

  it('blocks persist directory set to traversal path', async () => {
    const traversalCtx: ToolCallContext = {
      id: 'chroma_trav_1',
      toolName: 'chroma_client_init',
      params: {
        persist_directory: '../../sensitive_data',
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(traversalCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('Path traversal pattern detected');
  });

  it('blocks persist directory set to system root filesystem path', async () => {
    const rootCtx: ToolCallContext = {
      id: 'chroma_root_1',
      toolName: 'chroma_client_init',
      params: {
        persist_directory: '/',
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(rootCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('Root filesystem path detected');
  });

  it('allows safe local persist directory', async () => {
    const safeCtx: ToolCallContext = {
      id: 'chroma_safe_store',
      toolName: 'chroma_client_init',
      params: {
        persist_directory: './chroma_data',
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(safeCtx);
    expect(res.allowed).toBe(true);
    expect(res.verdict).toBe(Verdict.ALLOW);
  });
});
