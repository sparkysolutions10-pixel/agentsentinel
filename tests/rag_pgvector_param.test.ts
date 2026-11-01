import { describe, it, expect } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import { createPgvectorParameterEnforcerRule } from '../src/rag/pgvector_param_enforcer.js';
import { Verdict, ToolCallContext } from '../src/types.js';

describe('pgvector Parameter Enforcer (#335 & #336)', () => {
  const engine = new SentinelEngine();
  engine.registerRule(createPgvectorParameterEnforcerRule());

  it('blocks unparameterized raw string vector literal injection', async () => {
    const rawSqlCtx: ToolCallContext = {
      id: 'pgv_raw',
      toolName: 'execute_sql',
      params: { query: "SELECT * FROM items ORDER BY embedding <-> '[0.1, 0.2, 0.3]'::vector LIMIT 5;" },
      timestamp: Date.now()
    };
    const res = await engine.evaluate(rawSqlCtx);
    expect(res.allowed).toBe(false);
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].reason).toContain('Unparameterized raw vector literal detected');
  });

  it('allows properly parameterized pgvector queries', async () => {
    const safeSqlCtx: ToolCallContext = {
      id: 'pgv_safe',
      toolName: 'execute_sql',
      params: { query: 'SELECT * FROM items ORDER BY embedding <-> $1 LIMIT 5;', parameters: ['[0.1, 0.2, 0.3]'] },
      timestamp: Date.now()
    };
    const res = await engine.evaluate(safeSqlCtx);
    expect(res.allowed).toBe(true);
    expect(res.verdict).toBe(Verdict.ALLOW);
  });
});
