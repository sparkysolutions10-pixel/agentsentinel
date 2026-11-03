import { describe, it, expect } from 'vitest';
import { ElasticsearchDeleteByQueryGuard } from '../src/db/elasticsearch_delete_by_query_guard.js';

describe('ElasticsearchDeleteByQueryGuard Invariant Suite (#1923)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = ElasticsearchDeleteByQueryGuard.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_ELASTICSEARCH_DELETE_BY_QUERY_GUARD');
    expect(ElasticsearchDeleteByQueryGuard.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = ElasticsearchDeleteByQueryGuard.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(ElasticsearchDeleteByQueryGuard.validate('git status && npm run test')).toBe(true);
  });
});
