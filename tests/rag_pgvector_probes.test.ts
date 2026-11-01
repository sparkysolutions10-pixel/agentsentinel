import { describe, it, expect } from 'vitest';
import { createPgvectorProbeLimiterRule } from '../src/rag/pgvector_probe_limiter.js';
import { Verdict } from '../src/types.js';

describe('PgvectorProbeLimiter', () => {
  const rule = createPgvectorProbeLimiterRule(50);

  it('allows safe probes configuration <= 50', () => {
    const violation = rule.evaluate({
      toolName: 'pgvector_exec',
      params: { query: 'SET ivfflat.probes = 20;' }
    });
    expect(violation).toBeNull();
  });

  it('blocks excessive probes configuration > 50', () => {
    const violation = rule.evaluate({
      toolName: 'pgvector_exec',
      params: { query: 'SET ivfflat.probes = 200;' }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('high');
  });

  it('blocks explicit probes parameter exceeding bound', () => {
    const violation = rule.evaluate({
      toolName: 'sql_tool',
      params: { dialect: 'postgres', probes: 100 }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });

  it('ignores non-SQL tools', () => {
    const violation = rule.evaluate({
      toolName: 'file_read',
      params: { path: 'notes.txt' }
    });
    expect(violation).toBeNull();
  });
});
