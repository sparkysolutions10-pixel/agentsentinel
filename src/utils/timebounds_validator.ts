/**
 * TimeboundsValidator - Stellar transaction timebounds validation.
 */

export interface Timebounds {
  minTime: number | string | bigint;
  maxTime: number | string | bigint;
}

export class TimeboundsValidator {
  public static isValidTimebounds(tb: Timebounds): boolean {
    try {
      const min = BigInt(tb.minTime);
      const max = BigInt(tb.maxTime);

      if (min < 0n || max < 0n) return false;
      // maxTime 0 means no upper bound
      if (max !== 0n && min > max) return false;

      return true;
    } catch {
      return false;
    }
  }

  public static isWithinTimebounds(tb: Timebounds, currentUnixTimeSeconds: number = Math.floor(Date.now() / 1000)): boolean {
    if (!this.isValidTimebounds(tb)) return false;
    const current = BigInt(currentUnixTimeSeconds);
    const min = BigInt(tb.minTime);
    const max = BigInt(tb.maxTime);

    if (current < min) return false;
    if (max !== 0n && current > max) return false;

    return true;
  }
}
