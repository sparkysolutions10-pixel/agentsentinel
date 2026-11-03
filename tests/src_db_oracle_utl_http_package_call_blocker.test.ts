import { describe, it, expect } from 'vitest';
import { OracleUtlHttpPackageCallBlocker } from '../src/db/oracle_utl_http_package_call_blocker.js';

describe('OracleUtlHttpPackageCallBlocker Invariant Suite (#1941)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = OracleUtlHttpPackageCallBlocker.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_ORACLE_UTL_HTTP_PACKAGE_CALL_BLOCKER');
    expect(OracleUtlHttpPackageCallBlocker.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = OracleUtlHttpPackageCallBlocker.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(OracleUtlHttpPackageCallBlocker.validate('git status && npm run test')).toBe(true);
  });
});
