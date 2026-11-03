import { describe, it, expect } from 'vitest';
import { DynamodbScanWithoutLimitGuard } from '../src/db/dynamodb_scan_without_limit_guard.js';

describe('DynamodbScanWithoutLimitGuard Invariant Suite (#1931)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = DynamodbScanWithoutLimitGuard.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_DYNAMODB_SCAN_WITHOUT_LIMIT_GUARD');
    expect(DynamodbScanWithoutLimitGuard.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = DynamodbScanWithoutLimitGuard.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(DynamodbScanWithoutLimitGuard.validate('git status && npm run test')).toBe(true);
  });
});
