import { describe, it, expect } from 'vitest';
import { MurmurHash3Utility } from '../src/utils/murmurhash3.js';

describe('MurmurHash3Utility', () => {
  it('computes deterministic 32-bit hashes', () => {
    const h1 = MurmurHash3Utility.hash32('test_key');
    const h2 = MurmurHash3Utility.hash32('test_key');
    expect(h1).toBe(h2);
    expect(typeof h1).toBe('number');
  });

  it('produces 8-character hex outputs', () => {
    const hex = MurmurHash3Utility.hash32Hex('hello');
    expect(hex.length).toBe(8);
  });
});
