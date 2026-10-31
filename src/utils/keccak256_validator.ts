/**
 * AgentSentinel - Keccak256 Validator Utility
 * Validates, normalizes, and compares EVM / Ethereum 32-byte hashes and event topics.
 */

import { ConstantTimeEquality } from './constant_time_equality.js';

export class Keccak256Validator {
  public static isValidHash(hash: string): boolean {
    if (!hash || typeof hash !== 'string') return false;
    const clean = hash.trim();
    const raw = clean.startsWith('0x') || clean.startsWith('0X') ? clean.slice(2) : clean;
    return raw.length === 64 && /^[0-9a-fA-F]{64}$/.test(raw);
  }

  public static normalize(hash: string): string {
    if (!this.isValidHash(hash)) {
      throw new Error(`Invalid 32-byte hash string: "${hash}"`);
    }
    const clean = hash.trim().toLowerCase();
    return clean.startsWith('0x') ? clean : '0x' + clean;
  }

  public static areEqual(hash1: string, hash2: string): boolean {
    if (!this.isValidHash(hash1) || !this.isValidHash(hash2)) return false;
    const norm1 = this.normalize(hash1);
    const norm2 = this.normalize(hash2);
    return ConstantTimeEquality.areEqual(norm1, norm2);
  }
}
