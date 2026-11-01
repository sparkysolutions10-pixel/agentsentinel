import { describe, it, expect } from 'vitest';
import { createPromptSimilarityLeakAnalyzerRule, calculateJaccardSimilarity } from '../src/armor/prompt_similarity_leak_analyzer.js';
import { Verdict } from '../src/types.js';

describe('PromptSimilarityLeakAnalyzer', () => {
  const ref = 'Secret confidential company system prompt containing financial guidelines';
  const rule = createPromptSimilarityLeakAnalyzerRule(ref, 0.5);

  it('allows output with distinct topic', () => {
    const violation = rule.evaluate({
      toolName: 'agent_reply',
      params: { message: 'Weather in Tokyo is sunny today.' }
    });
    expect(violation).toBeNull();
  });

  it('blocks output repeating system instructions with high overlap', () => {
    const violation = rule.evaluate({
      toolName: 'agent_reply',
      params: { message: 'Here is the secret confidential company system prompt with financial guidelines' }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('critical');
  });
});
