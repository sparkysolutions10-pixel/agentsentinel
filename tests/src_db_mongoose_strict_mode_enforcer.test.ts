import { describe, it, expect } from 'vitest';
import { MongooseStrictModeEnforcer } from '../src/db/mongoose_strict_mode_enforcer.js';

describe('MongooseStrictModeEnforcer Invariant Suite (#1952)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = MongooseStrictModeEnforcer.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MONGOOSE_STRICT_MODE_ENFORCER');
    expect(MongooseStrictModeEnforcer.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = MongooseStrictModeEnforcer.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(MongooseStrictModeEnforcer.validate('git status && npm run test')).toBe(true);
  });
});
