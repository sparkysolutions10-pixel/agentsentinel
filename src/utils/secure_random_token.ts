/**
 * AgentSentinel - Secure Random Token Generator Utility
 * Generates cryptographically strong random tokens, hex nonces, and UUIDs.
 */

import crypto from 'node:crypto';

export class SecureRandomToken {
  private static readonly DEFAULT_ALPHABET =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

  public static generate(length: number = 32, alphabet: string = this.DEFAULT_ALPHABET): string {
    if (length <= 0) return '';
    const bytes = crypto.randomBytes(length);
    let result = '';
    const alphaLen = alphabet.length;
    for (let i = 0; i < length; i++) {
      result += alphabet[bytes[i] % alphaLen];
    }
    return result;
  }

  public static generateHex(byteLength: number = 16): string {
    return crypto.randomBytes(byteLength).toString('hex');
  }

  public static generateUuid(): string {
    return crypto.randomUUID();
  }
}
