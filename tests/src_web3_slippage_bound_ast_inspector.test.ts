import { describe, it, expect } from 'vitest';
import { SlippageBoundAstInspector } from '../src/web3/slippage_bound_ast_inspector.js';

describe('SlippageBoundAstInspector Invariant Suite (#1759)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = SlippageBoundAstInspector.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_SLIPPAGE_BOUND_AST_INSPECTOR');
    expect(SlippageBoundAstInspector.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = SlippageBoundAstInspector.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(SlippageBoundAstInspector.validate('git status && npm run test')).toBe(true);
  });
});
