import { describe, it, expect } from 'vitest';
import { createDecompressionBombGuardRule } from '../src/rag/decompression_bomb_guard.js';
import { Verdict } from '../src/types.js';

describe('DecompressionBombGuard', () => {
  const rule = createDecompressionBombGuardRule(100);

  it('allows safe normal compression ratios (10:1)', () => {
    const violation = rule.evaluate({
      toolName: 'doc_extract',
      params: { compressedBytes: 1000, uncompressedBytes: 10000 }
    });
    expect(violation).toBeNull();
  });

  it('blocks dangerous decompression bomb ratios (500:1)', () => {
    const violation = rule.evaluate({
      toolName: 'doc_extract',
      params: { compressedBytes: 1000, uncompressedBytes: 500000 }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('critical');
  });
});
