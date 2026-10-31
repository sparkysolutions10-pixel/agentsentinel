import { describe, it, expect } from 'vitest';
import { TokenLengthEstimator } from '../src/utils/token_length_estimator.js';

describe('TokenLengthEstimator', () => {
  it('estimates token counts with reasonable accuracy', () => {
    const text = 'AgentSentinel protects AI agents from prompt injections and unauthorized tool executions.';
    const estimate = TokenLengthEstimator.estimateTokenCount(text);
    expect(estimate).toBeGreaterThan(10);
    expect(estimate).toBeLessThan(40);
  });

  it('correctly checks token budgets', () => {
    const text = 'Short prompt';
    expect(TokenLengthEstimator.isWithinTokenLimit(text, 100)).toBe(true);
    expect(TokenLengthEstimator.isWithinTokenLimit(text, 1)).toBe(false);
  });
});
