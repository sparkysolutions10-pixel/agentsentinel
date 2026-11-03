import { describe, it, expect } from 'vitest';
import { WmiEventSubscriptionPersistence } from '../src/ast/wmi_event_subscription_persistence.js';

describe('WmiEventSubscriptionPersistence Invariant Suite (#1899)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = WmiEventSubscriptionPersistence.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_WMI_EVENT_SUBSCRIPTION_PERSISTENCE');
    expect(WmiEventSubscriptionPersistence.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = WmiEventSubscriptionPersistence.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(WmiEventSubscriptionPersistence.validate('git status && npm run test')).toBe(true);
  });
});
