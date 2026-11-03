import { describe, it, expect } from 'vitest';
import { RegulatorySarSuspiciousActivityExport } from '../src/fintech/regulatory_sar_suspicious_activity_export.js';

describe('RegulatorySarSuspiciousActivityExport Invariant Suite (#2003)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = RegulatorySarSuspiciousActivityExport.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_REGULATORY_SAR_SUSPICIOUS_ACTIVITY_EXPORT');
    expect(RegulatorySarSuspiciousActivityExport.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = RegulatorySarSuspiciousActivityExport.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(RegulatorySarSuspiciousActivityExport.validate('git status && npm run test')).toBe(true);
  });
});
