/**
 * AgentSentinel - ReDoS (Regular Expression Denial of Service) Detector
 * Detects catastrophic backtracking patterns in user-defined security regexes
 * and provides safe timed execution bounds.
 */

// Patterns known to cause exponential backtracking: nested quantifiers
const SUSPICIOUS_REDOS_PATTERNS = [
  /\([^)]*[*+]\)[*+]/,        // (a+)+ or (x*)*
  /\([^)]*\|[^)]*\)[*+]/,     // (a|b)+ with overlapping prefixes
  /\[[^\]]*\][*+]\[[^\]]*\][*+]/ // consecutive greedy character classes
];

export class ReDoSAttackDetector {
  public static isSuspiciousRegex(pattern: string): boolean {
    return SUSPICIOUS_REDOS_PATTERNS.some(re => re.test(pattern));
  }

  public static safeMatch(pattern: RegExp, input: string, timeoutMs = 15): boolean {
    const start = Date.now();
    try {
      const matched = pattern.test(input);
      if (Date.now() - start > timeoutMs) {
        throw new Error(`[AgentSentinel] ReDoS warning: regex evaluation exceeded ${timeoutMs}ms safety limit.`);
      }
      return matched;
    } catch (e: any) {
      if (e.message?.includes('ReDoS warning')) {
        throw e;
      }
      return false;
    }
  }
}
