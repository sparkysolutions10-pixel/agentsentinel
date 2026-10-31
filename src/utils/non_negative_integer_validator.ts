/**
 * AgentSentinel - Non-Negative Integer Validator Utility
 * Validates non-negative integer parameter bounds and provides ceiling clamping.
 */

export class NonNegativeIntegerValidator {
  public static isValid(val: unknown, max?: number): boolean {
    if (typeof val !== 'number' || !Number.isInteger(val) || val < 0) {
      return false;
    }
    if (max !== undefined && val > max) {
      return false;
    }
    return true;
  }

  public static clamp(val: number, max: number): number {
    if (!Number.isFinite(val) || val < 0) return 0;
    const intVal = Math.floor(val);
    return Math.min(intVal, max);
  }
}
