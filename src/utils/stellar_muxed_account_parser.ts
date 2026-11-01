export class StellarMuxedAccountParser {
  public static isMuxed(address: string): boolean {
    if (!address || typeof address !== 'string') return false;
    return address.startsWith('M') && address.length === 69;
  }
}
