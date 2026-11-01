import { describe, it, expect } from 'vitest';
import { createDocumentDeduplicatorRule } from '../src/rag/document_deduplicator.js';
import { Verdict } from '../src/types.js';

describe('DocumentDeduplicator', () => {
  it('allows new hash and blocks duplicate replay', () => {
    const rule = createDocumentDeduplicatorRule();
    const hash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

    const first = rule.evaluate({ toolName: 'dedup', params: { hash } });
    expect(first).toBeNull();

    const second = rule.evaluate({ toolName: 'dedup', params: { hash } });
    expect(second).not.toBeNull();
    expect(second?.verdict).toBe(Verdict.BLOCK);
  });
});
