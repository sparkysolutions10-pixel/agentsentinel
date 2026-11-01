import { describe, it, expect } from 'vitest';
import { createChunkPiiRedactorRule } from '../src/rag/chunk_pii_redactor.js';
import { Verdict } from '../src/types.js';

describe('ChunkPiiRedactor', () => {
  const rule = createChunkPiiRedactorRule();

  it('allows clean metadata without PII', () => {
    const violation = rule.evaluate({ toolName: 'chunk_meta', params: { metadata: { source: 'doc1.pdf', page: 5 } } });
    expect(violation).toBeNull();
  });

  it('blocks metadata with unredacted SSN', () => {
    const violation = rule.evaluate({ toolName: 'chunk_meta', params: { metadata: { authorSSN: '123-45-6789' } } });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('critical');
  });

  it('blocks metadata with raw email addresses', () => {
    const violation = rule.evaluate({ toolName: 'chunk_meta', params: { metadata: { contact: 'admin@corp.internal' } } });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });
});
