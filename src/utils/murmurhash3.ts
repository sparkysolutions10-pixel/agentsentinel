/**
 * AgentSentinel - MurmurHash3 32-bit Utility
 * High-performance non-cryptographic hash for Bloom filters and hash tables.
 */

export class MurmurHash3Utility {
  public static hash32(key: string, seed: number = 0): number {
    const bytes = Buffer.from(key, 'utf-8');
    let h1 = seed >>> 0;
    const c1 = 0xcc9e2d51;
    const c2 = 0x1b873593;
    const len = bytes.length;
    const nblocks = Math.floor(len / 4);

    for (let i = 0; i < nblocks; i++) {
      const idx = i * 4;
      let k1 =
        (bytes[idx] & 0xff) |
        ((bytes[idx + 1] & 0xff) << 8) |
        ((bytes[idx + 2] & 0xff) << 16) |
        ((bytes[idx + 3] & 0xff) << 24);

      k1 = Math.imul(k1, c1);
      k1 = (k1 << 15) | (k1 >>> 17);
      k1 = Math.imul(k1, c2);

      h1 ^= k1;
      h1 = (h1 << 13) | (h1 >>> 19);
      h1 = (Math.imul(h1, 5) + 0xe6546b64) >>> 0;
    }

    let k1 = 0;
    const tailIdx = nblocks * 4;
    const rem = len & 3;

    if (rem === 3) k1 ^= (bytes[tailIdx + 2] & 0xff) << 16;
    if (rem >= 2) k1 ^= (bytes[tailIdx + 1] & 0xff) << 8;
    if (rem >= 1) {
      k1 ^= bytes[tailIdx] & 0xff;
      k1 = Math.imul(k1, c1);
      k1 = (k1 << 15) | (k1 >>> 17);
      k1 = Math.imul(k1, c2);
      h1 ^= k1;
    }

    h1 ^= len;
    h1 ^= h1 >>> 16;
    h1 = Math.imul(h1, 0x85ebca6b);
    h1 ^= h1 >>> 13;
    h1 = Math.imul(h1, 0xc2b2ae35);
    h1 ^= h1 >>> 16;

    return h1 >>> 0;
  }

  public static hash32Hex(key: string, seed: number = 0): string {
    return this.hash32(key, seed).toString(16).padStart(8, '0');
  }
}
