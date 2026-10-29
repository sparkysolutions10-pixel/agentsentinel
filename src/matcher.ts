/**
 * High-performance Glob & Regex Pattern Matcher for Tool Names & Namespaces.
 * Supports wildcards (*, ?), prefix/suffix globs (fs:*, *_exec), and explicit regexes.
 */

const regexCache = new Map<string, RegExp>();
const MAX_CACHE_SIZE = 1000;

/**
 * Converts a standard wildcard/glob pattern into a compiled RegExp.
 */
export function globToRegExp(glob: string, caseSensitive: boolean = false): RegExp {
  const cached = regexCache.get(glob);
  if (cached) return cached;

  // Escape special regex chars except * and ?
  let regexStr = '^';
  for (let i = 0; i < glob.length; i++) {
    const char = glob[i];
    if (char === '*') {
      regexStr += '.*';
    } else if (char === '?') {
      regexStr += '.';
    } else if (['.', '+', '^', '$', '{', '}', '(', ')', '|', '[', ']', '\\'].includes(char)) {
      regexStr += '\\' + char;
    } else {
      regexStr += char;
    }
  }
  regexStr += '$';

  const compiled = new RegExp(regexStr, caseSensitive ? undefined : 'i');

  if (regexCache.size >= MAX_CACHE_SIZE) {
    const firstKey = regexCache.keys().next().value;
    if (firstKey) regexCache.delete(firstKey);
  }
  regexCache.set(glob, compiled);

  return compiled;
}

/**
 * Parses an explicit regex pattern string (e.g. `/^fs:(read|write)$/i` or `regex:^db:.*$`).
 */
export function parseRegexPattern(pattern: string): RegExp | null {
  if (pattern.startsWith('regex:')) {
    const raw = pattern.slice(6);
    try {
      return new RegExp(raw);
    } catch {
      return null;
    }
  }

  if (pattern.startsWith('/') && pattern.lastIndexOf('/') > 0) {
    const lastSlash = pattern.lastIndexOf('/');
    const body = pattern.slice(1, lastSlash);
    const flags = pattern.slice(lastSlash + 1);
    try {
      return new RegExp(body, flags);
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Matches a target string against a wildcard, glob, or regex pattern.
 */
export function matchesPattern(target: string, pattern: string): boolean {
  if (pattern === '*' || pattern === target) {
    return true;
  }

  // Check explicit regex syntax (/.../ or regex:...)
  const explicitRegex = parseRegexPattern(pattern);
  if (explicitRegex) {
    return explicitRegex.test(target);
  }

  // Glob / wildcard match
  if (pattern.includes('*') || pattern.includes('?')) {
    return globToRegExp(pattern).test(target);
  }

  // Case-insensitive exact fallback
  return target.toLowerCase() === pattern.toLowerCase();
}

/**
 * Checks if a target string matches any of the given patterns.
 */
export function matchesAnyPattern(target: string, patterns: string[]): boolean {
  if (!patterns || patterns.length === 0) return false;
  for (const pattern of patterns) {
    if (matchesPattern(target, pattern)) {
      return true;
    }
  }
  return false;
}

/**
 * Returns a compiled predicate function for maximum evaluation speed.
 */
export function compilePattern(pattern: string): (target: string) => boolean {
  if (pattern === '*') return () => true;

  const explicitRegex = parseRegexPattern(pattern);
  if (explicitRegex) {
    return (target: string) => explicitRegex.test(target);
  }

  if (pattern.includes('*') || pattern.includes('?')) {
    const rx = globToRegExp(pattern);
    return (target: string) => rx.test(target);
  }

  const lower = pattern.toLowerCase();
  return (target: string) => target.toLowerCase() === lower;
}
