/**
 * AgentSentinel - Float Precision Clamp Utility
 * Enforces decimal precision bounds on floating-point numbers for financial safety.
 */

export class FloatPrecisionClamp {
  public static round(val: number, decimals: number = 2): number {
    if (!Number.isFinite(val)) return 0;
    const factor = Math.pow(10, decimals);
    return Math.round(val * factor) / factor;
  }

  public static hasValidPrecision(val: number, maxDecimals: number): boolean {
    if (!Number.isFinite(val)) return false;
    const str = val.toString();
    const parts = str.split('.');
    if (parts.length === 1) return true;
    return parts[1].length <= maxDecimals;
  }
}
