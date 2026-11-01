import { describe, it, expect } from 'vitest';
import { createTokenEntropyRule } from '../src/armor/token_entropy_rule.js';
import { calculateShannonEntropy } from '../src/secrets/index.js';
import { Verdict } from '../src/types.js';

describe('TokenEntropyRule', () => {
  const rule = createTokenEntropyRule(4.8);

  it('computes zero entropy for repetitive text', () => {
    expect(calculateShannonEntropy('aaaaa')).toBe(0);
  });

  it('allows natural language sentences with normal entropy', () => {
    const violation = rule.evaluate({
      toolName: 'llm_query',
      params: { text: 'The quick brown fox jumps over the lazy dog in the sunny park.' }
    });
    expect(violation).toBeNull();
  });

  it('flags high entropy base64/random binary blobs', () => {
    const highEntropy = 'V2hhdGV2ZXJSYW5kb21TdHJpbmc0MzkwMjh1aWZqZGtzbGY4MzQyOWhma2Rsc2ZqdmtsZHNmaGtzbGY=';
    const violation = rule.evaluate({
      toolName: 'llm_query',
      params: { payload: highEntropy }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('medium');
  });
});
