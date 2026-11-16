/**
 * Safe glob/wildcard matcher supporting * and ? without regex catastrophic backtracking.
 */
export declare class WildcardPatternMatcher {
    static matches(pattern: string, text: string, caseSensitive?: boolean): boolean;
    static isAnyMatch(patterns: string[], text: string, caseSensitive?: boolean): boolean;
}
//# sourceMappingURL=wildcard_pattern_matcher.d.ts.map