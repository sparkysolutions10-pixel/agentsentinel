import { describe, it, expect } from 'vitest';
import { createSyntaxTreeDepthValidatorRule } from '../src/armor/syntax_tree_depth_validator.js';
import { Verdict } from '../src/types.js';

describe('SyntaxTreeDepthValidator', () => {
  const rule = createSyntaxTreeDepthValidatorRule(16);

  it('allows shallow object trees', () => {
    const violation = rule.evaluate({
      toolName: 'parse_prompt',
      params: { a: { b: { c: 'hello' } } }
    });
    expect(violation).toBeNull();
  });

  it('blocks deeply nested recursive object attacks (>16 levels)', () => {
    let deep: any = { value: 'leaf' };
    for (let i = 0; i < 20; i++) {
      deep = { child: deep };
    }

    const violation = rule.evaluate({
      toolName: 'parse_prompt',
      params: deep
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('high');
  });
});
