/**
 * AgentSentinel - Constant Time Equality Utility
 * Prevents timing side-channel attacks during secret or signature comparison.
 */

import crypto from 'node:crypto';

export class ConstantTimeEquality {
  public static areEqual(a: string | Uint8Array, b: string | Uint8Array): boolean {
    const bufA = typeof a === 'string' ? Buffer.from(a, 'utf-8') : Buffer.from(a);
    const bufB = typeof b === 'string' ? Buffer.from(b, 'utf-8') : Buffer.from(b);

    if (bufA.length !== bufB.length) {
      return false;
    }

    return crypto.timingSafeEqual(bufA, bufB);
  }
}
