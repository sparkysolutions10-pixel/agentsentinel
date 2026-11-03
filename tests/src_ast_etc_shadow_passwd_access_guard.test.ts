import { describe, it, expect } from 'vitest';
import { EtcShadowPasswdAccessGuard } from '../src/ast/etc_shadow_passwd_access_guard.js';

describe('EtcShadowPasswdAccessGuard Invariant Suite (#1860)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = EtcShadowPasswdAccessGuard.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_ETC_SHADOW_PASSWD_ACCESS_GUARD');
    expect(EtcShadowPasswdAccessGuard.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = EtcShadowPasswdAccessGuard.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(EtcShadowPasswdAccessGuard.validate('git status && npm run test')).toBe(true);
  });
});
