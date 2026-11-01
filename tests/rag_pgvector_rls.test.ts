import { describe, it, expect } from 'vitest';
import { createPgvectorRlsInjectorRule } from '../src/rag/pgvector_rls_injector.js';
import { Verdict } from '../src/types.js';

describe('PgvectorRlsInjector', () => {
  const rule = createPgvectorRlsInjectorRule();

  it('allows vector query with valid tenant ID in params', () => {
    const violation = rule.evaluate({
      toolName: 'pgvector_query',
      params: { query: 'SELECT * FROM items ORDER BY embedding <-> $1 LIMIT 5;', tenantId: 'tenant-123' }
    });
    expect(violation).toBeNull();
  });

  it('blocks vector query missing tenant ID', () => {
    const violation = rule.evaluate({
      toolName: 'pgvector_query',
      params: { query: 'SELECT * FROM items ORDER BY embedding <-> $1 LIMIT 5;' }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('critical');
  });

  it('blocks vector query with empty string tenant ID', () => {
    const violation = rule.evaluate({
      toolName: 'pgvector_query',
      params: { query: 'SELECT * FROM items;', tenant_id: '   ' }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });
});
