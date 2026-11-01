import { describe, it, expect } from 'vitest';
import { createDocumentChunkClampRule } from '../src/rag/document_chunk_clamp.js';
import { Verdict } from '../src/types.js';

describe('DocumentChunkClamp', () => {
  const rule = createDocumentChunkClampRule(100);

  it('allows chunks within max limit', () => {
    const violation = rule.evaluate({ toolName: 'chunker', params: { chunkText: 'Short paragraph text.' } });
    expect(violation).toBeNull();
  });

  it('blocks chunks exceeding character limit', () => {
    const violation = rule.evaluate({ toolName: 'chunker', params: { chunkText: 'A'.repeat(500) } });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });
});
