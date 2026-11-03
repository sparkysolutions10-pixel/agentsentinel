import { describe, it, expect } from 'vitest';
import { ArmTrustzoneSecureWorldBridge } from '../src/crypto/arm_trustzone_secure_world_bridge.js';

describe('ArmTrustzoneSecureWorldBridge Invariant Suite (#2028)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = ArmTrustzoneSecureWorldBridge.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_ARM_TRUSTZONE_SECURE_WORLD_BRIDGE');
    expect(ArmTrustzoneSecureWorldBridge.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = ArmTrustzoneSecureWorldBridge.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(ArmTrustzoneSecureWorldBridge.validate('git status && npm run test')).toBe(true);
  });
});
