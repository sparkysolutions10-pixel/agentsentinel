/**
 * AgentSentinel - SHA-256 Digest Validator Utility
 * Validates, calculates, and verifies 256-bit SHA hashes.
 */

import crypto from 'node:crypto';
import { ConstantTimeEquality } from './constant_time_equality.js';

export class Sha256DigestValidator {
  public static compute(data: string | Uint8Array): string {
    const hash = crypto.createHash('sha256');
    if (typeof data === 'string') {
      hash.update(data, 'utf-8');
    } else {
      hash.update(data);
    }
    return hash.digest('hex');
  }

  public static isValidDigest(digest: string): boolean {
    if (!digest || typeof digest !== 'string') return false;
    const clean = digest.trim().toLowerCase();
    const raw = clean.startsWith('0x') ? clean.slice(2) : clean;
    return raw.length === 64 && /^[0-9a-f]{64}$/.test(raw);
  }

  public static verify(data: string | Uint8Array, expectedDigest: string): boolean {
    if (!this.isValidDigest(expectedDigest)) return false;
    const actual = this.compute(data);
    const cleanExpected = expectedDigest.trim().toLowerCase().replace(/^0x/, '');
    return ConstantTimeEquality.areEqual(actual, cleanExpected);
  }
}
