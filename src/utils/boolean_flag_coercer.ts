/**
 * AgentSentinel - Boolean Flag Coercer Utility
 * Strictly coerces heterogeneous boolean representations, rejecting ambiguous values.
 */

export class BooleanFlagCoercer {
  private static readonly TRUE_VALUES = new Set(['true', '1', 'yes', 'y', 'on', 'enabled']);
  private static readonly FALSE_VALUES = new Set(['false', '0', 'no', 'n', 'off', 'disabled']);

  public static coerce(val: unknown): boolean | null {
    if (typeof val === 'boolean') return val;
    if (val === 1) return true;
    if (val === 0) return false;

    if (typeof val === 'string') {
      const clean = val.trim().toLowerCase();
      if (this.TRUE_VALUES.has(clean)) return true;
      if (this.FALSE_VALUES.has(clean)) return false;
    }

    return null; // Ambiguous or unsupported representation
  }
}
