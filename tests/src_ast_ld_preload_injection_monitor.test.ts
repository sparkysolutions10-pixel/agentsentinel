import { describe, it, expect } from 'vitest';
import { LdPreloadInjectionMonitor } from '../src/ast/ld_preload_injection_monitor.js';

describe('LdPreloadInjectionMonitor Invariant Suite (#1873)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = LdPreloadInjectionMonitor.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_LD_PRELOAD_INJECTION_MONITOR');
    expect(LdPreloadInjectionMonitor.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = LdPreloadInjectionMonitor.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(LdPreloadInjectionMonitor.validate('git status && npm run test')).toBe(true);
  });
});
