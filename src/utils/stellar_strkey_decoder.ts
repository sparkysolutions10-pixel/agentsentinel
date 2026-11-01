export type StellarStrKeyType = 'Account' | 'Contract' | 'Seed' | 'Muxed' | 'Invalid';

export class StellarStrkeyDecoder {
  public static getKeyType(strkey: string): StellarStrKeyType {
    if (!strkey || typeof strkey !== 'string') return 'Invalid';
    const clean = strkey.trim();
    if (clean.length === 56) {
      if (clean.startsWith('G')) return 'Account';
      if (clean.startsWith('C')) return 'Contract';
      if (clean.startsWith('S')) return 'Seed';
    }
    if (clean.length === 69 && clean.startsWith('M')) {
      return 'Muxed';
    }
    return 'Invalid';
  }
}
