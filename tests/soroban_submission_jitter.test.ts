import { describe, it, expect } from 'vitest';
import { createSorobanSubmissionJitterRule } from '../src/web3/soroban_submission_jitter.js';
import { Verdict } from '../src/types.js';

describe('SorobanSubmissionJitterRule', () => {
  it('allows initial transaction submission without retries', () => {
    const rule = createSorobanSubmissionJitterRule();
    const violation = rule.evaluate({
      toolName: 'soroban_submit_tx',
      params: { retryCount: 0 }
    });
    expect(violation).toBeNull();
  });

  it('allows retries that respect exponential backoff duration', () => {
    const rule = createSorobanSubmissionJitterRule({ minIntervalMs: 500 });
    const violation = rule.evaluate({
      toolName: 'soroban_submit_tx',
      params: { retryCount: 1, timeSinceLastAttemptMs: 1000 }
    });
    expect(violation).toBeNull();
  });

  it('blocks rapid unjittered retry bursts', () => {
    const rule = createSorobanSubmissionJitterRule({ minIntervalMs: 500 });
    const violation = rule.evaluate({
      toolName: 'soroban_submit_tx',
      params: { retryCount: 2, timeSinceLastAttemptMs: 150 }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('RAPID_RETRY_UNJITTERED');
  });
});
