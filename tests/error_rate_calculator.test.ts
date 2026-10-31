import { describe, it, expect } from 'vitest';
import { ErrorRateCalculator } from '../src/utils/error_rate_calculator.js';

describe('ErrorRateCalculator', () => {
  it('computes error rate as ratio between 0 and 1', () => {
    const calc = new ErrorRateCalculator(60000);
    const t = 100000;

    for (let i = 0; i < 8; i++) calc.recordSuccess(t);
    for (let i = 0; i < 2; i++) calc.recordError('network_timeout', t);

    expect(calc.getTotalEvents(t)).toBe(10);
    expect(calc.getErrorRate(t)).toBe(0.2);
  });

  it('categorizes errors by type', () => {
    const calc = new ErrorRateCalculator(60000);
    const t = 100000;

    calc.recordError('auth_failure', t);
    calc.recordError('auth_failure', t);
    calc.recordError('quota_exceeded', t);

    const counts = calc.getErrorCountByType(t);
    expect(counts.auth_failure).toBe(2);
    expect(counts.quota_exceeded).toBe(1);
  });

  it('triggers threshold only after minEvents reached', () => {
    const calc = new ErrorRateCalculator(60000);
    const t = 100000;

    calc.recordError('timeout', t);
    // 1 error out of 1 event = 100% error rate, but minEvents is 5
    expect(calc.isExceedingThreshold(0.5, 5, t)).toBe(false);

    for (let i = 0; i < 4; i++) calc.recordError('timeout', t);
    // Now 5 events, 100% error rate >= 50%
    expect(calc.isExceedingThreshold(0.5, 5, t)).toBe(true);
  });
});
