import { describe, it, expect } from 'vitest';
import { VolumeBootRecordTamperShield } from '../src/ast/volume_boot_record_tamper_shield.js';

describe('VolumeBootRecordTamperShield Invariant Suite (#1902)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = VolumeBootRecordTamperShield.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_VOLUME_BOOT_RECORD_TAMPER_SHIELD');
    expect(VolumeBootRecordTamperShield.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = VolumeBootRecordTamperShield.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(VolumeBootRecordTamperShield.validate('git status && npm run test')).toBe(true);
  });
});
