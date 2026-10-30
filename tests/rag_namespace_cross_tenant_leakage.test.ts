import { describe, it, expect } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import { createNamespaceIsolationGuardRule } from '../src/rag/namespace_isolation.js';
import { Verdict, ToolCallContext } from '../src/types.js';

describe('Cross-Tenant Vector Namespace Leakage Prevention Suite (#280)', () => {
  const engine = new SentinelEngine();
  engine.registerRule(
    createNamespaceIsolationGuardRule({
      allowedNamespaces: ['tenant-alpha', 'tenant-shared-knowledge'],
      blockEmptyNamespace: true,
      blockWildcardNamespace: true,
    })
  );

  it('blocks path traversal style namespace escapes (e.g. tenant-alpha/../tenant-beta)', async () => {
    const traversalCtx: ToolCallContext = {
      id: 'leak_traversal',
      toolName: 'pinecone_query',
      params: {
        namespace: 'tenant-alpha/../tenant-beta',
        vector: [0.1, 0.2],
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(traversalCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('Tenant boundary violation');
  });

  it('blocks SQL-style injection payloads inside namespace parameters', async () => {
    const sqlInjectionCtx: ToolCallContext = {
      id: 'leak_sql',
      toolName: 'pinecone_query',
      params: {
        namespace: "tenant-alpha' OR '1'='1",
        vector: [0.1, 0.2],
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(sqlInjectionCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('Tenant boundary violation');
  });

  it('blocks URL encoded namespace evasion attempts', async () => {
    const encodedCtx: ToolCallContext = {
      id: 'leak_encoded',
      toolName: 'pinecone_query',
      params: {
        namespace: 'tenant%2Db',
        vector: [0.1, 0.2],
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(encodedCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
  });

  it('blocks null byte poisoned namespace strings', async () => {
    const nullByteCtx: ToolCallContext = {
      id: 'leak_nullbyte',
      toolName: 'pinecone_query',
      params: {
        namespace: 'tenant-alpha\0tenant-beta',
        vector: [0.1, 0.2],
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(nullByteCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
  });

  it('allows authorized shared knowledge-base namespace queries', async () => {
    const sharedCtx: ToolCallContext = {
      id: 'leak_shared_ok',
      toolName: 'vector_search',
      params: {
        namespace: 'tenant-shared-knowledge',
        vector: [0.1, 0.2, 0.3],
        topK: 10,
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(sharedCtx);
    expect(res.allowed).toBe(true);
    expect(res.verdict).toBe(Verdict.ALLOW);
  });
});
