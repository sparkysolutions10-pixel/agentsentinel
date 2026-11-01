import { describe, it, expect } from 'vitest';
import { createClipAlignmentVerifierRule } from '../src/rag/clip_alignment_verifier.js';
import { Verdict } from '../src/types.js';

describe('ClipAlignmentVerifier', () => {
  const rule = createClipAlignmentVerifierRule(0.15);

  it('allows aligned multimodal inputs', () => {
    const violation = rule.evaluate({ toolName: 'multimodal_embed', params: { clipSimilarity: 0.85 } });
    expect(violation).toBeNull();
  });

  it('blocks misaligned typographic attacks', () => {
    const violation = rule.evaluate({ toolName: 'multimodal_embed', params: { clipSimilarity: 0.02 } });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });
});
