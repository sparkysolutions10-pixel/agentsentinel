/**
 * AgentSentinel - Regex Pattern Validator Utility
 * Tests regular expression validity and screens against catastrophic backtracking (ReDoS) hazards.
 */
export declare class RegexPatternValidator {
    private static readonly REDOS_REGEX;
    static isValidPattern(pattern: string): boolean;
    static isPotentialRedos(pattern: string): boolean;
}
//# sourceMappingURL=regex_pattern_validator.d.ts.map