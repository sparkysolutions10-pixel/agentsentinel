/**
 * AgentSentinel - Safe JSON Utility
 * Safely stringifies complex objects containing circular references and BigInts,
 * and parses JSON with guaranteed fallbacks.
 */

export class SafeJson {
  public static stringify(value: any, space?: number): string {
    const seen = new WeakSet();
    return JSON.stringify(
      value,
      (_key, val) => {
        if (typeof val === 'object' && val !== null) {
          if (seen.has(val)) {
            return '[Circular]';
          }
          seen.add(val);
        }
        if (typeof val === 'bigint') {
          return val.toString() + 'n';
        }
        return val;
      },
      space
    );
  }

  public static parseSafe<T>(json: string, fallback: T): T {
    try {
      if (typeof json !== 'string') return fallback;
      return JSON.parse(json) as T;
    } catch {
      return fallback;
    }
  }
}
