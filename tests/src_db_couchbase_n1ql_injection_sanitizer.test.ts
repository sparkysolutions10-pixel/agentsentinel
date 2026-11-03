import { describe, it, expect } from 'vitest';
import { CouchbaseN1qlInjectionSanitizer } from '../src/db/couchbase_n1ql_injection_sanitizer.js';

describe('CouchbaseN1qlInjectionSanitizer Invariant Suite (#1942)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = CouchbaseN1qlInjectionSanitizer.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_COUCHBASE_N1QL_INJECTION_SANITIZER');
    expect(CouchbaseN1qlInjectionSanitizer.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = CouchbaseN1qlInjectionSanitizer.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(CouchbaseN1qlInjectionSanitizer.validate('git status && npm run test')).toBe(true);
  });
});
