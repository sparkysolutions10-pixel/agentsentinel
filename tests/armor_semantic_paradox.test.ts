import { describe, it, expect } from 'vitest';
import { createSemanticParadoxFilterRule } from '../src/armor/semantic_paradox_filter.js';
import { Verdict } from '../src/types.js';

describe('SemanticParadoxFilter', () => {
  const rule = createSemanticParadoxFilterRule();

  it('allows benign philosophical questions', () => {
    const violation = rule.evaluate({
      toolName: 'prompt_filter',
      params: { text: 'What did Aristotle write about ethics?' }
    });
    expect(violation).toBeNull();
  });

  it('blocks classic liar paradox "This statement is false"', () => {
    const violation = rule.evaluate({
      toolName: 'prompt_filter',
      params: { text: 'Analyze this statement is false.' }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });
});
