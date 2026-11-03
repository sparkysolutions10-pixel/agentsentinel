import { describe, it, expect } from 'vitest';
import { ForkbombBashFunctionDetector } from '../src/ast/forkbomb_bash_function_detector.js';

describe('ForkbombBashFunctionDetector Invariant Suite (#1858)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = ForkbombBashFunctionDetector.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_FORKBOMB_BASH_FUNCTION_DETECTOR');
    expect(ForkbombBashFunctionDetector.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = ForkbombBashFunctionDetector.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(ForkbombBashFunctionDetector.validate('git status && npm run test')).toBe(true);
  });
});
