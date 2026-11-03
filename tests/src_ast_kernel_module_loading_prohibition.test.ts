import { describe, it, expect } from 'vitest';
import { KernelModuleLoadingProhibition } from '../src/ast/kernel_module_loading_prohibition.js';

describe('KernelModuleLoadingProhibition Invariant Suite (#1872)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = KernelModuleLoadingProhibition.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_KERNEL_MODULE_LOADING_PROHIBITION');
    expect(KernelModuleLoadingProhibition.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = KernelModuleLoadingProhibition.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(KernelModuleLoadingProhibition.validate('git status && npm run test')).toBe(true);
  });
});
