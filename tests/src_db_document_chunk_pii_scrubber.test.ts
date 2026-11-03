import { describe, it, expect } from 'vitest';
import { DocumentChunkPiiScrubber } from '../src/db/document_chunk_pii_scrubber.js';

describe('DocumentChunkPiiScrubber Invariant Suite (#1919)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = DocumentChunkPiiScrubber.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_DOCUMENT_CHUNK_PII_SCRUBBER');
    expect(DocumentChunkPiiScrubber.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = DocumentChunkPiiScrubber.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(DocumentChunkPiiScrubber.validate('git status && npm run test')).toBe(true);
  });
});
