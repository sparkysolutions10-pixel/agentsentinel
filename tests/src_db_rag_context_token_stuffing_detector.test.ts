import { describe, it, expect } from 'vitest';
import { RagContextTokenStuffingDetector } from '../src/db/rag_context_token_stuffing_detector.js';

describe('RagContextTokenStuffingDetector Invariant Suite (#1918)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = RagContextTokenStuffingDetector.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_RAG_CONTEXT_TOKEN_STUFFING_DETECTOR');
    expect(RagContextTokenStuffingDetector.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = RagContextTokenStuffingDetector.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(RagContextTokenStuffingDetector.validate('git status && npm run test')).toBe(true);
  });
});
