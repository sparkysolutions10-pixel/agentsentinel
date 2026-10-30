/**
 * File Path Traversal Guard.
 * Intercepts directory escape attempts and relative dot-dot path traversal
 * (e.g. `../../etc/passwd`, `..\..\windows\system32`) across POSIX and Windows,
 * including URL-encoded, double-encoded, and Unicode overlong variations.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export const DEFAULT_FS_PATH_FIELDS: string[] = [
  'path',
  'filePath',
  'file_path',
  'filepath',
  'filename',
  'file',
  'targetPath',
  'target_path',
  'dest',
  'destination',
  'src',
  'source',
  'dir',
  'directory',
];

export interface PathTraversalDetection {
  hasTraversal: boolean;
  depth: number;
  rawPath: string;
  normalizedPath?: string;
  matchedPattern?: string;
  reason?: string;
}

// Regex matching ../ or ..\ or leading/trailing .. segments
const DIRECT_TRAVERSAL_REGEX = /(?:^|[/\\])\.\.(?:[/\\]|$)/;
const ENCODED_DOT_REGEX = /(?:%2e|\.){2}(?:%2f|%5c|[/\\])/i;
const DOUBLE_ENCODED_REGEX = /%252e%252e/i;

/**
 * Normalizes Unicode homoglyphs, overlong UTF-8 bytes, and multi-pass URL encodings.
 */
export function normalizePathEncodings(pathStr: string): string {
  if (!pathStr || typeof pathStr !== 'string') return '';

  let normalized = pathStr;

  // 1. Unicode NFKC normalization
  try {
    normalized = normalized.normalize('NFKC');
  } catch {
    // fallback
  }

  // 2. Full-width unicode dot and slash replacements
  normalized = normalized
    .replace(/[\uFF0E\u3002\u2024]/g, '.') // fullwidth full stop, ideographic full stop, one dot leader
    .replace(/[\uFF0F\u2215]/g, '/')      // fullwidth solidus, division slash
    .replace(/[\uFF3C\u2216]/g, '\\');    // fullwidth reverse solidus, set minus

  // 3. Overlong UTF-8 representations (%c0%ae -> ., %c0%af -> /, %c1%9c -> \)
  normalized = normalized
    .replace(/%(?:c0%ae|e0%80%ae)/gi, '.')
    .replace(/%(?:c0%af|e0%80%af)/gi, '/')
    .replace(/%(?:c1%9c|c0%5c|e0%80%5c)/gi, '\\');

  // 4. Multi-pass URL decoding (up to 3 passes to unwrap nested/double encodings)
  for (let pass = 0; pass < 3; pass++) {
    if (/%[0-9a-fA-F]{2}/.test(normalized)) {
      try {
        const decoded = decodeURIComponent(normalized);
        if (decoded === normalized) break;
        normalized = decoded;
      } catch {
        // If decodeURIComponent fails on malformed sequence, manually replace hex codes
        normalized = normalized
          .replace(/%2e/gi, '.')
          .replace(/%2f/gi, '/')
          .replace(/%5c/gi, '\\')
          .replace(/%25/gi, '%');
      }
    } else {
      break;
    }
  }

  return normalized;
}

/**
 * Checks whether a given string contains relative directory traversal escapes.
 */
export function isPathTraversal(pathStr: string): boolean {
  if (!pathStr || typeof pathStr !== 'string') return false;

  if (DIRECT_TRAVERSAL_REGEX.test(pathStr)) return true;
  if (ENCODED_DOT_REGEX.test(pathStr)) return true;
  if (DOUBLE_ENCODED_REGEX.test(pathStr)) return true;

  const normalized = normalizePathEncodings(pathStr);
  if (DIRECT_TRAVERSAL_REGEX.test(normalized)) return true;

  return false;
}

/**
 * Detailed inspection of path traversal depth and pattern.
 */
export function detectPathTraversal(pathStr: string): PathTraversalDetection {
  if (!pathStr || typeof pathStr !== 'string') {
    return { hasTraversal: false, depth: 0, rawPath: pathStr || '' };
  }

  const normalized = normalizePathEncodings(pathStr);
  const matches = normalized.match(/(?:\.\.[/\\]|\.\.$|[/\\]\.\.)/g);
  const depth = matches ? matches.length : 0;
  const hasDirect = isPathTraversal(pathStr);

  if (hasDirect || depth > 0) {
    const isObfuscated = normalized !== pathStr;
    const pattern = isObfuscated ? 'Encoded/Unicode directory escape' : '.. directory escape';

    return {
      hasTraversal: true,
      depth: Math.max(depth, 1),
      rawPath: pathStr,
      normalizedPath: isObfuscated ? normalized : undefined,
      matchedPattern: pattern,
      reason: `Relative path traversal escape sequence detected${isObfuscated ? ' (obfuscated encoding resolved)' : ''} (depth: ${Math.max(depth, 1)})`,
    };
  }

  return {
    hasTraversal: false,
    depth: 0,
    rawPath: pathStr,
  };
}

export interface PathTraversalGuardOptions {
  pathFields?: string[];
  allowRelativeSubpaths?: boolean;
}

/**
 * Creates SentinelRule to guard against file path traversal attacks.
 */
export function createPathTraversalGuardRule(options?: PathTraversalGuardOptions): SentinelRule {
  const pathFields = options?.pathFields || DEFAULT_FS_PATH_FIELDS;

  return {
    id: 'fs-block-path-traversal',
    name: 'Guard Against Relative Path Traversal Escapes',
    category: 'fs',
    priority: 950,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      if (!ctx.params || typeof ctx.params !== 'object') {
        return null;
      }

      for (const field of pathFields) {
        const val = ctx.params[field];
        if (typeof val === 'string' && val.trim() !== '') {
          const detection = detectPathTraversal(val);
          if (detection.hasTraversal) {
            return {
              ruleId: 'fs-block-path-traversal',
              ruleName: 'Guard Against Relative Path Traversal Escapes',
              severity: 'critical',
              verdict: Verdict.BLOCK,
              reason: `Path traversal attempt intercepted in '${field}': ${detection.reason} ('${val}')`,
            };
          }
        }
      }

      return null;
    },
  };
}

export const pathTraversalGuardRule: SentinelRule = createPathTraversalGuardRule();
