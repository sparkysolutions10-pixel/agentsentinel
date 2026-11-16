/**
 * AgentSentinel - ReDoS (Regular Expression Denial of Service) Detector
 * Detects catastrophic backtracking patterns in user-defined security regexes
 * and provides safe timed execution bounds.
 */
// Patterns known to cause exponential backtracking: nested quantifiers
const SUSPICIOUS_REDOS_PATTERNS = [
    /\([^)]*[*+]\)[*+]/, // (a+)+ or (x*)*
    /\([^)]*\|[^)]*\)[*+]/, // (a|b)+ with overlapping prefixes
    /\[[^\]]*\][*+]\[[^\]]*\][*+]/ // consecutive greedy character classes
];
export class ReDoSAttackDetector {
    static isSuspiciousRegex(pattern) {
        return SUSPICIOUS_REDOS_PATTERNS.some(re => re.test(pattern));
    }
    static safeMatch(pattern, input, timeoutMs = 15) {
        const start = Date.now();
        try {
            const matched = pattern.test(input);
            if (Date.now() - start > timeoutMs) {
                throw new Error(`[AgentSentinel] ReDoS warning: regex evaluation exceeded ${timeoutMs}ms safety limit.`);
            }
            return matched;
        }
        catch (e) {
            if (e.message?.includes('ReDoS warning')) {
                throw e;
            }
            return false;
        }
    }
}
//# sourceMappingURL=redos_attack_detector.js.map