import { describe, it, expect } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import { createMilvusRbacInterceptorRule } from '../src/rag/milvus_rbac_interceptor.js';
import { Verdict, ToolCallContext } from '../src/types.js';

describe('Milvus RBAC Interceptor (#323 & #324)', () => {
  const engine = new SentinelEngine();
  engine.registerRule(createMilvusRbacInterceptorRule());

  it('rejects unauthorized escalation to admin role', async () => {
    const adminCtx: ToolCallContext = {
      id: 'rbac_1',
      toolName: 'grant_role',
      params: { user: 'guest_agent', role: 'admin' },
      timestamp: Date.now()
    };
    const res = await engine.evaluate(adminCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('Unauthorized privilege escalation attempt');
  });

  it('allows granting regular read roles', async () => {
    const safeCtx: ToolCallContext = {
      id: 'rbac_2',
      toolName: 'grant_role',
      params: { user: 'worker_agent', role: 'read_only' },
      timestamp: Date.now()
    };
    const res = await engine.evaluate(safeCtx);
    expect(res.allowed).toBe(true);
    expect(res.verdict).toBe(Verdict.ALLOW);
  });
});
