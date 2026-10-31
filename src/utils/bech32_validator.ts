/**
 * AgentSentinel - Bech32 Validator Utility
 * Validates Bech32 addresses (BIP-173) for cross-chain tool inputs.
 */

const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

export class Bech32Validator {
  public static isValid(address: string, expectedHrp?: string): boolean {
    if (!address || typeof address !== 'string') return false;
    if (address.length < 8 || address.length > 90) return false;

    const lower = address.toLowerCase();
    const upper = address.toUpperCase();
    if (address !== lower && address !== upper) return false;

    const pos = lower.lastIndexOf('1');
    if (pos < 1 || pos + 7 > lower.length) return false;

    const hrp = lower.substring(0, pos);
    const dataPart = lower.substring(pos + 1);

    if (expectedHrp && hrp !== expectedHrp.toLowerCase()) {
      return false;
    }

    for (let i = 0; i < dataPart.length; i++) {
      if (CHARSET.indexOf(dataPart[i]) === -1) {
        return false;
      }
    }
    return true;
  }

  public static parse(address: string): { hrp: string; dataPart: string } | null {
    if (!this.isValid(address)) return null;
    const lower = address.toLowerCase();
    const pos = lower.lastIndexOf('1');
    return {
      hrp: lower.substring(0, pos),
      dataPart: lower.substring(pos + 1)
    };
  }
}
