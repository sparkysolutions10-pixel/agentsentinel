import { describe, it, expect } from 'vitest';
import { createPgvectorOperatorFilterRule } from '../src/rag/pgvector_operator_filter.js';
import { Verdict } from '../src/types.js';

describe('PgvectorOperatorFilter', () => {
  const rule = createPgvectorOperatorFilterRule();

  it('allows valid pgvector cosine distance queries', () => {
    const violation = rule.evaluate({
      toolName: 'sql_runner',
      params: { query: "SELECT * FROM vectors ORDER BY embedding <=> '[0.1, 0.2, 0.3]' LIMIT 10;" }
    });
    expect(violation).toBeNull();
  });

  it('blocks vector distance query containing NaN', () => {
    const violation = rule.evaluate({
      toolName: 'sql_runner',
      params: { query: "SELECT * FROM vectors ORDER BY embedding <-> '[0.1, NaN, 0.3]' LIMIT 10;" }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });

  it('blocks vector distance query containing Infinity', () => {
    const violation = rule.evaluate({
      toolName: 'sql_runner',
      params: { query: "SELECT * FROM vectors ORDER BY embedding <#> '[0.1, Infinity, 0.3]' LIMIT 10;" }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });
});
