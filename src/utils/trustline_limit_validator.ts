/**
 * TrustlineLimitValidator - Stellar trustline limit validation and int64 boundary enforcement.
 */

export class TrustlineLimitValidator {
  public static readonly MAX_INT64_STROOPS = 9223372036854775807n;

  public static isValidLimit(limitStr: string): boolean {
    if (!limitStr || typeof limitStr !== 'string') return false;
    const trimmed = limitStr.trim();
    if (!/^[0-9]+(\.[0-9]{1,7})?$/.test(trimmed)) return false;

    try {
      const parts = trimmed.split('.');
      const whole = BigInt(parts[0] || '0');
      let fracStr = parts[1] || '0';
      fracStr = fracStr.padEnd(7, '0').slice(0, 7);
      const frac = BigInt(fracStr);

      const totalStroops = whole * 10000000n + frac;
      return totalStroops >= 0n && totalStroops <= this.MAX_INT64_STROOPS;
    } catch {
      return false;
    }
  }

  public static isClosingTrustline(limitStr: string): boolean {
    if (!this.isValidLimit(limitStr)) return false;
    return parseFloat(limitStr) === 0;
  }
}
