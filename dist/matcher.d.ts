/**
 * High-performance Glob & Regex Pattern Matcher for Tool Names & Namespaces.
 * Supports wildcards (*, ?), prefix/suffix globs (fs:*, *_exec), and explicit regexes.
 */
/**
 * Converts a standard wildcard/glob pattern into a compiled RegExp.
 */
export declare function globToRegExp(glob: string, caseSensitive?: boolean): RegExp;
/**
 * Parses an explicit regex pattern string (e.g. `/^fs:(read|write)$/i` or `regex:^db:.*$`).
 */
export declare function parseRegexPattern(pattern: string): RegExp | null;
/**
 * Matches a target string against a wildcard, glob, or regex pattern.
 */
export declare function matchesPattern(target: string, pattern: string): boolean;
/**
 * Checks if a target string matches any of the given patterns.
 */
export declare function matchesAnyPattern(target: string, patterns: string[]): boolean;
/**
 * Returns a compiled predicate function for maximum evaluation speed.
 */
export declare function compilePattern(pattern: string): (target: string) => boolean;
//# sourceMappingURL=matcher.d.ts.map