/**
 * AgentSentinel - Base58 Validator Utility
 * Validates, encodes, and decodes Base58 strings commonly used in crypto addresses.
 */

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const ALPHABET_MAP: Record<string, number> = {};
for (let i = 0; i < ALPHABET.length; i++) {
  ALPHABET_MAP[ALPHABET[i]] = i;
}

export class Base58Validator {
  public static isValid(str: string): boolean {
    if (!str || typeof str !== 'string') return false;
    for (const char of str) {
      if (ALPHABET_MAP[char] === undefined) return false;
    }
    return true;
  }

  public static decode(str: string): Uint8Array {
    if (!this.isValid(str)) {
      throw new Error(`Invalid base58 string: "${str}"`);
    }
    if (str.length === 0) return new Uint8Array(0);

    const bytes: number[] = [0];
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const value = ALPHABET_MAP[char];
      for (let j = 0; j < bytes.length; j++) {
        bytes[j] *= 58;
      }
      bytes[0] += value;
      let carry = 0;
      for (let j = 0; j < bytes.length; j++) {
        bytes[j] += carry;
        carry = bytes[j] >> 8;
        bytes[j] &= 0xff;
      }
      while (carry > 0) {
        bytes.push(carry & 0xff);
        carry >>= 8;
      }
    }

    let leadingZeros = 0;
    while (leadingZeros < str.length && str[leadingZeros] === '1') {
      leadingZeros++;
    }

    const result = new Uint8Array(leadingZeros + bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      result[result.length - 1 - i] = bytes[i];
    }
    return result;
  }

  public static encode(bytes: Uint8Array): string {
    if (bytes.length === 0) return '';
    const digits: number[] = [0];
    for (let i = 0; i < bytes.length; i++) {
      let carry = bytes[i];
      for (let j = 0; j < digits.length; j++) {
        carry += digits[j] << 8;
        digits[j] = carry % 58;
        carry = (carry / 58) | 0;
      }
      while (carry > 0) {
        digits.push(carry % 58);
        carry = (carry / 58) | 0;
      }
    }
    let str = '';
    for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
      str += '1';
    }
    for (let i = digits.length - 1; i >= 0; i--) {
      str += ALPHABET[digits[i]];
    }
    return str;
  }
}
