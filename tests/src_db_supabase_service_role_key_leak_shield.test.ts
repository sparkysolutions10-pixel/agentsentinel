import { describe, it, expect } from 'vitest';
import { SupabaseServiceRoleKeyLeakShield } from '../src/db/supabase_service_role_key_leak_shield.js';

describe('SupabaseServiceRoleKeyLeakShield Invariant Suite (#1943)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = SupabaseServiceRoleKeyLeakShield.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_SUPABASE_SERVICE_ROLE_KEY_LEAK_SHIELD');
    expect(SupabaseServiceRoleKeyLeakShield.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = SupabaseServiceRoleKeyLeakShield.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(SupabaseServiceRoleKeyLeakShield.validate('git status && npm run test')).toBe(true);
  });
});
