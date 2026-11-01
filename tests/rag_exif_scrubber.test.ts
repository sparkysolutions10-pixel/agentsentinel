import { describe, it, expect } from 'vitest';
import { createExifMetadataScrubberRule } from '../src/rag/exif_metadata_scrubber.js';
import { Verdict } from '../src/types.js';

describe('ExifMetadataScrubber', () => {
  const rule = createExifMetadataScrubberRule();

  it('allows scrubbed clean image metadata', () => {
    const violation = rule.evaluate({ toolName: 'image_embed', params: { imageMetadata: { width: 1024, height: 768 } } });
    expect(violation).toBeNull();
  });

  it('blocks image metadata containing GPS coordinates', () => {
    const violation = rule.evaluate({ toolName: 'image_embed', params: { exif: { GPSLatitude: '37.7749 N' } } });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });
});
