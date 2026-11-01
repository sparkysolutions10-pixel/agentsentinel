import { describe, it, expect } from 'vitest';
import { Base32Encoder } from '../src/utils/base32_encoder.js';

describe('Base32Encoder', () => {
  it('encodes and decodes standard test vectors', () => {
    const input = Buffer.from('hello');
    const encoded = Base32Encoder.encode(input);
    expect(encoded).toBe('NBSWY3DP');
    const decoded = Base32Encoder.decode(encoded);
    expect(decoded.toString('utf-8')).toBe('hello');
  });

  it('handles empty inputs', () => {
    expect(Base32Encoder.encode(Buffer.alloc(0))).toBe('');
    expect(Base32Encoder.decode('').length).toBe(0);
  });
});
