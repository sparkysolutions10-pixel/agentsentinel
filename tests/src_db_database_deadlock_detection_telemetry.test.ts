import { describe, it, expect } from 'vitest';
import { DatabaseDeadlockDetectionTelemetry } from '../src/db/database_deadlock_detection_telemetry.js';

describe('DatabaseDeadlockDetectionTelemetry Invariant Suite (#1948)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = DatabaseDeadlockDetectionTelemetry.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_DATABASE_DEADLOCK_DETECTION_TELEMETRY');
    expect(DatabaseDeadlockDetectionTelemetry.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = DatabaseDeadlockDetectionTelemetry.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(DatabaseDeadlockDetectionTelemetry.validate('git status && npm run test')).toBe(true);
  });
});
