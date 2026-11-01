import { describe, it, expect } from 'vitest';
import { createFillerTokenSummarizerRule } from '../src/armor/filler_token_summarizer.js';
import { Verdict } from '../src/types.js';

describe('FillerTokenSummarizer', () => {
  const rule = createFillerTokenSummarizerRule();

  it('allows normal clean input text', () => {
    const violation = rule.evaluate({
      toolName: 'prompt_filter',
      params: { text: 'Please summarize our quarterly financial report.' }
    });
    expect(violation).toBeNull();
  });

  it('blocks excessive repetitive lorem ipsum filler padding', () => {
    const filler = 'lorem ipsum dolor sit amet '.repeat(10);
    const violation = rule.evaluate({
      toolName: 'prompt_filter',
      params: { text: filler }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });
});
