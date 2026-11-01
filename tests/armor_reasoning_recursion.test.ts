import { describe, it, expect } from 'vitest';
import { createReasoningRecursionKillerRule } from '../src/armor/reasoning_recursion_killer.js';
import { Verdict } from '../src/types.js';

describe('ReasoningRecursionKiller', () => {
  const rule = createReasoningRecursionKillerRule(30);

  it('allows normal reasoning step depth (<30)', () => {
    const violation = rule.evaluate({
      toolName: 'think_step',
      params: { reasoningSteps: 12 }
    });
    expect(violation).toBeNull();
  });

  it('blocks runaway reasoning depth (>30 steps)', () => {
    const violation = rule.evaluate({
      toolName: 'think_step',
      params: { reasoningSteps: 45 }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });
});
