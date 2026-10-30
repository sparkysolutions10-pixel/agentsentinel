import { describe, it, expect } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import {
  inspectNamespaceBoundary,
  createNamespaceIsolationGuardRule,
} from '../src/rag/namespace_isolation.js';
import { Verdict, ToolCallContext } from '../src/types.js';

describe('Multi-Tenant Namespace Isolation Guard (#279 & #280)', () => {
  const engine = new SentinelEngine();
  engine.registerRule(
    createNamespaceIsolationGuardRule({
      allowedNamespaces: ['tenant-alpha', 'tenant-shared-docs'],
      blockEmptyNamespace: true,
      blockWildcardNamespace: true,
    })
  );

  it('allows vector queries targeting permitted tenant namespace', async () => {
    const validCtx: ToolCallContext = {
      id: 'ns_valid',
      toolName: 'pinecone_query',
      params: {
        namespace: 'tenant-alpha',
        vector: [0.1, 0.2, 0.3],
        topK: 5,
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(validCtx);
    expect(res.allowed).toBe(true);
    expect(res.verdict).toBe(Verdict.ALLOW);
  });

  it('blocks vector queries attempting to access unauthorized foreign tenant namespace', async () => {
    const foreignCtx: ToolCallContext = {
      id: 'ns_unauthorized',
      toolName: 'pinecone_query',
      params: {
        namespace: 'tenant-finance-secrets', // Not in allowed list!
        vector: [0.1, 0.2, 0.3],
        topK: 5,
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(foreignCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].ruleId).toBe('rag-namespace-isolation-guard');
    expect(res.violations[0].reason).toContain('Tenant boundary violation');
  });

  it('blocks empty or missing namespace to prevent tenant partition leakage', async () => {
    const emptyNsCtx: ToolCallContext = {
      id: 'ns_empty',
      toolName: 'pinecone_query',
      params: {
        namespace: '',
        vector: [0.1, 0.2, 0.3],
      },
      timestamp: Date.now(),
    };

    const res = await engine.evaluate(emptyNsCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('Empty or undefined vector namespace is prohibited');
  });

  it('blocks wildcard and admin namespace bypass attempts', async () => {
    const wildcards = ['*', '.*', '__all__', '__admin__', 'all_tenants', '%all%'];

    for (const wc of wildcards) {
      const wcCtx: ToolCallContext = {
        id: `ns_wc_${wc}`,
        toolName: 'pinecone_query',
        params: { namespace: wc, vector: [0.1, 0.2] },
        timestamp: Date.now(),
      };

      const res = await engine.evaluate(wcCtx);
      expect(res.allowed).toBe(false);
      expect(res.verdict).toBe(Verdict.BLOCK);
      expect(res.violations[0].reason).toContain('Wildcard or administrative namespace');
    }
  });

  it('supports dynamic agent-to-tenant namespace resolver', async () => {
    const dynamicEngine = new SentinelEngine();
    dynamicEngine.registerRule(
      createNamespaceIsolationGuardRule({
        resolveAllowedNamespaces: (ctx) => {
          if (ctx.agentId === 'agent-beta') {
            return ['tenant-beta'];
          }
          return ['tenant-default'];
        },
      })
    );

    // Agent beta querying tenant beta -> Allowed
    const betaCtx: ToolCallContext = {
      id: 'dynamic_beta_ok',
      agentId: 'agent-beta',
      toolName: 'vector_search',
      params: { namespace: 'tenant-beta', vector: [0.1] },
      timestamp: Date.now(),
    };
    const betaRes = await dynamicEngine.evaluate(betaCtx);
    expect(betaRes.allowed).toBe(true);

    // Agent beta querying tenant alpha -> Blocked
    const crossCtx: ToolCallContext = {
      id: 'dynamic_cross_blocked',
      agentId: 'agent-beta',
      toolName: 'vector_search',
      params: { namespace: 'tenant-alpha', vector: [0.1] },
      timestamp: Date.now(),
    };
    const crossRes = await dynamicEngine.evaluate(crossCtx);
    expect(crossRes.allowed).toBe(false);
    expect(crossRes.violations[0].reason).toContain('Tenant boundary violation');
  });
});
