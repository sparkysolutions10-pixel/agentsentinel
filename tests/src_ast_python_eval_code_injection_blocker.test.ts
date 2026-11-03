import { describe, it, expect } from 'vitest';
import { PythonEvalCodeInjectionBlocker } from '../src/ast/python_eval_code_injection_blocker.js';

describe('PythonEvalCodeInjectionBlocker Invariant Suite (#1876)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = PythonEvalCodeInjectionBlocker.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_PYTHON_EVAL_CODE_INJECTION_BLOCKER');
    expect(PythonEvalCodeInjectionBlocker.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = PythonEvalCodeInjectionBlocker.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(PythonEvalCodeInjectionBlocker.validate('git status && npm run test')).toBe(true);
  });
});
