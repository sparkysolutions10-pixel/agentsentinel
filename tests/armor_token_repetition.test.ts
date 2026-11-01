import { describe, it, expect } from 'vitest';
import { createTokenRepetitionClampRule } from '../src/armor/token_repetition_clamp.js';
import { Verdict } from '../src/types.js';

describe('TokenRepetitionClamp', () => {
  const rule = createTokenRepetitionClampRule(0.6);

  it('allows varied vocabulary', () => {
    const violation = rule.evaluate({
      toolName: 'prompt_filter',
      params: { text: 'Here is a varied text with lots of diverse vocabulary and normal distributions of words.' }
    });
    expect(violation).toBeNull();
  });

  it('blocks compute exhaustion spam with 80% identical words', () => {
    const spam = 'poem '.repeat(20) + 'cat dog fish bird';
    const violation = rule.evaluate({
      toolName: 'prompt_filter',
      params: { text: spam }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });
});
