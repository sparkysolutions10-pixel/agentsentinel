import { describe, it, expect } from 'vitest';
import { FlashloanCallbackIsolation } from '../src/web3/flashloan_callback_isolation.js';

describe('FlashloanCallbackIsolation Invariant Suite (#1762)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = FlashloanCallbackIsolation.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_FLASHLOAN_CALLBACK_ISOLATION');
    expect(FlashloanCallbackIsolation.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = FlashloanCallbackIsolation.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(FlashloanCallbackIsolation.validate('git status && npm run test')).toBe(true);
  });
});
