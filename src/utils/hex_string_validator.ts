/**
 * AgentSentinel - Hex String Validator Utility
 * Validates, normalizes, and decodes hexadecimal strings for Web3 and tool payloads.
 */

export interface HexOptions {
  prefixRequired?: boolean;
  byteLength?: number;
}

export class HexStringValidator {
  public static normalize(hex: string): string {
    if (typeof hex !== 'string') return '';
    const trimmed = hex.trim();
    return trimmed.startsWith('0x') || trimmed.startsWith('0X')
      ? trimmed.slice(2).toLowerCase()
      : trimmed.toLowerCase();
  }

  public static toPrefixed(hex: string): string {
    const norm = this.normalize(hex);
    return '0x' + norm;
  }

  public static isValid(hex: string, options: HexOptions = {}): boolean {
    if (typeof hex !== 'string') return false;
    const trimmed = hex.trim();
    if (options.prefixRequired && !trimmed.startsWith('0x') && !trimmed.startsWith('0X')) {
      return false;
    }
    const raw = trimmed.startsWith('0x') || trimmed.startsWith('0X') ? trimmed.slice(2) : trimmed;
    if (raw.length === 0 && options.byteLength !== 0) return false;
    if (raw.length % 2 !== 0) return false;
    if (!/^[0-9a-fA-F]*$/.test(raw)) return false;
    if (options.byteLength !== undefined && raw.length !== options.byteLength * 2) {
      return false;
    }
    return true;
  }

  public static toBytes(hex: string): Uint8Array {
    const norm = this.normalize(hex);
    if (norm.length % 2 !== 0 || !/^[0-9a-fA-F]*$/.test(norm)) {
      throw new Error(`Invalid hex string: "${hex}"`);
    }
    const bytes = new Uint8Array(norm.length / 2);
    for (let i = 0; i < norm.length; i += 2) {
      bytes[i / 2] = parseInt(norm.substring(i, i + 2), 16);
    }
    return bytes;
  }
}
