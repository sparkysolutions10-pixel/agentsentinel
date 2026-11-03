import { describe, it, expect } from 'vitest';
import { NosqlMongodbWhereEvalInjection } from '../src/db/nosql_mongodb_where_eval_injection.js';

describe('NosqlMongodbWhereEvalInjection Invariant Suite (#1920)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = NosqlMongodbWhereEvalInjection.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_NOSQL_MONGODB_WHERE_EVAL_INJECTION');
    expect(NosqlMongodbWhereEvalInjection.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = NosqlMongodbWhereEvalInjection.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(NosqlMongodbWhereEvalInjection.validate('git status && npm run test')).toBe(true);
  });
});
