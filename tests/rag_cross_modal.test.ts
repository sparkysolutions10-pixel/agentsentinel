import { describe, it, expect } from 'vitest';
import { createCrossModalContrastAnalyzerRule } from '../src/rag/cross_modal_contrast_analyzer.js';
import { Verdict } from '../src/types.js';

describe('CrossModalContrastAnalyzer', () => {
  const rule = createCrossModalContrastAnalyzerRule(0.7);

  it('allows concordant multimodal inputs with low divergence', () => {
    const violation = rule.evaluate({ toolName: 'multimodal_eval', params: { modalityDivergence: 0.15 } });
    expect(violation).toBeNull();
  });

  it('blocks discordant multimodal inputs with high divergence', () => {
    const violation = rule.evaluate({ toolName: 'multimodal_eval', params: { modalityDivergence: 0.88 } });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });
});
