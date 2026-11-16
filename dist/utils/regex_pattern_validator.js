/**
 * AgentSentinel - Regex Pattern Validator Utility
 * Tests regular expression validity and screens against catastrophic backtracking (ReDoS) hazards.
 */
export class RegexPatternValidator {
    // Flag patterns with nested quantifiers: (a+)+ or ([a-z]*)*
    static REDOS_REGEX = /\([^)]*[+*][^)]*\)[+*]/;
    static isValidPattern(pattern) {
        if (!pattern || typeof pattern !== 'string')
            return false;
        try {
            new RegExp(pattern);
            return true;
        }
        catch {
            return false;
        }
    }
    static isPotentialRedos(pattern) {
        if (!this.isValidPattern(pattern))
            return false;
        return this.REDOS_REGEX.test(pattern);
    }
}
//# sourceMappingURL=regex_pattern_validator.js.map