import { describe, it, expect } from 'vitest';
import { createMilvusLifecycleGuardRule } from '../src/rag/milvus_lifecycle_guard.js';
import { Verdict } from '../src/types.js';

describe('MilvusLifecycleGuard', () => {
  const rule = createMilvusLifecycleGuardRule();

  it('blocks drop_collection call on milvus client', () => {
    const violation = rule.evaluate({
      toolName: 'milvus_query',
      params: { client: 'milvus', method: 'drop_collection' }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('critical');
  });

  it('blocks release_collection call on milvus client', () => {
    const violation = rule.evaluate({
      toolName: 'milvus_query',
      params: { client: 'milvus', method: 'release_collection' }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });

  it('blocks releaseCollection variant toolName', () => {
    const violation = rule.evaluate({
      toolName: 'milvus_releasecollection',
      params: {}
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });

  it('allows benign search queries on milvus', () => {
    const violation = rule.evaluate({
      toolName: 'milvus_search',
      params: { client: 'milvus', method: 'search', collection: 'docs' }
    });
    expect(violation).toBeNull();
  });
});
