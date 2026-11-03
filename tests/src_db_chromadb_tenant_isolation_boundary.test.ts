import { describe, it, expect } from 'vitest';
import { ChromadbTenantIsolationBoundary } from '../src/db/chromadb_tenant_isolation_boundary.js';

describe('ChromadbTenantIsolationBoundary Invariant Suite (#1914)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = ChromadbTenantIsolationBoundary.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_CHROMADB_TENANT_ISOLATION_BOUNDARY');
    expect(ChromadbTenantIsolationBoundary.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = ChromadbTenantIsolationBoundary.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(ChromadbTenantIsolationBoundary.validate('git status && npm run test')).toBe(true);
  });
});
