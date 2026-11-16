/**
 * AgentSentinel - ReDoS (Regular Expression Denial of Service) Detector
 * Detects catastrophic backtracking patterns in user-defined security regexes
 * and provides safe timed execution bounds.
 */
export declare class ReDoSAttackDetector {
    static isSuspiciousRegex(pattern: string): boolean;
    static safeMatch(pattern: RegExp, input: string, timeoutMs?: number): boolean;
}
//# sourceMappingURL=redos_attack_detector.d.ts.map