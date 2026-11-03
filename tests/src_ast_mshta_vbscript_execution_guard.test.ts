import { describe, it, expect } from 'vitest';
import { MshtaVbscriptExecutionGuard } from '../src/ast/mshta_vbscript_execution_guard.js';

describe('MshtaVbscriptExecutionGuard Invariant Suite (#1890)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = MshtaVbscriptExecutionGuard.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MSHTA_VBSCRIPT_EXECUTION_GUARD');
    expect(MshtaVbscriptExecutionGuard.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = MshtaVbscriptExecutionGuard.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(MshtaVbscriptExecutionGuard.validate('git status && npm run test')).toBe(true);
  });
});
