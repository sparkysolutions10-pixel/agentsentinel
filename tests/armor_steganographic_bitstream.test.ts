import { describe, it, expect } from 'vitest';
import { createSteganographicBitstreamDecoderRule, decodeZeroWidthBitstream } from '../src/armor/steganographic_bitstream_decoder.js';
import { Verdict } from '../src/types.js';

describe('SteganographicBitstreamDecoder', () => {
  const rule = createSteganographicBitstreamDecoderRule();

  function encodeToZeroWidth(str: string): string {
    let out = '';
    for (let i = 0; i < str.length; i++) {
      const bin = str.charCodeAt(i).toString(2).padStart(8, '0');
      for (const bit of bin) {
        out += bit === '0' ? '\u200B' : '\u200C';
      }
    }
    return out;
  }

  it('encodes and decodes zero-width bitstreams', () => {
    const encoded = encodeToZeroWidth('admin');
    expect(decodeZeroWidthBitstream(encoded)).toBe('admin');
  });

  it('blocks message hiding "admin" via steganographic zero-width bitstream', () => {
    const carrier = `Normal text ${encodeToZeroWidth('admin')} end of text.`;
    const violation = rule.evaluate({
      toolName: 'prompt_filter',
      params: { text: carrier }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });
});
