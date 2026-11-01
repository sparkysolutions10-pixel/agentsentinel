import { describe, it, expect } from 'vitest';
import { createPgvectorIndexGuardRule } from '../src/rag/pgvector_index_guard.js';
import { Verdict } from '../src/types.js';

describe('PgvectorIndexGuard', () => {
  const rule = createPgvectorIndexGuardRule();

  it('allows CREATE INDEX CONCURRENTLY using HNSW', () => {
    const violation = rule.evaluate({
      toolName: 'db_migration',
      params: { query: 'CREATE INDEX CONCURRENTLY idx_items_hnsw ON items USING hnsw (embedding vector_cosine_ops);' }
    });
    expect(violation).toBeNull();
  });

  it('blocks non-concurrent CREATE INDEX using IVFFLAT', () => {
    const violation = rule.evaluate({
      toolName: 'db_migration',
      params: { query: 'CREATE INDEX idx_items_ivf ON items USING ivfflat (embedding vector_cosine_ops);' }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('high');
  });

  it('ignores standard btree indexes', () => {
    const violation = rule.evaluate({
      toolName: 'db_migration',
      params: { query: 'CREATE INDEX idx_user_id ON users (id);' }
    });
    expect(violation).toBeNull();
  });
});
