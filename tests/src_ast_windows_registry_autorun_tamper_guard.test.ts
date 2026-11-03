import { describe, it, expect } from 'vitest';
import { WindowsRegistryAutorunTamperGuard } from '../src/ast/windows_registry_autorun_tamper_guard.js';

describe('WindowsRegistryAutorunTamperGuard Invariant Suite (#1887)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = WindowsRegistryAutorunTamperGuard.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_WINDOWS_REGISTRY_AUTORUN_TAMPER_GUARD');
    expect(WindowsRegistryAutorunTamperGuard.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = WindowsRegistryAutorunTamperGuard.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(WindowsRegistryAutorunTamperGuard.validate('git status && npm run test')).toBe(true);
  });
});
