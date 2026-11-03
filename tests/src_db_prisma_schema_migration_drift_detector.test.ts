import { describe, it, expect } from 'vitest';
import { PrismaSchemaMigrationDriftDetector } from '../src/db/prisma_schema_migration_drift_detector.js';

describe('PrismaSchemaMigrationDriftDetector Invariant Suite (#1949)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = PrismaSchemaMigrationDriftDetector.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_PRISMA_SCHEMA_MIGRATION_DRIFT_DETECTOR');
    expect(PrismaSchemaMigrationDriftDetector.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = PrismaSchemaMigrationDriftDetector.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(PrismaSchemaMigrationDriftDetector.validate('git status && npm run test')).toBe(true);
  });
});
