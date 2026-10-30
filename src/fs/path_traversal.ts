/**
 * File Path Traversal Guard.
 * Intercepts directory escape attempts and relative dot-dot path traversal
 * (e.g. `../../etc/passwd`, `..\..\windows\system32`) across POSIX and Windows.
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
  matchedPattern?: string;
  reason?: string;
}

// Regex matching ../ or ..\ or leading/trailing .. segments
const DIRECT_TRAVERSAL_REGEX = /(?:^|[/\\])\.\.(?:[/\\]|$)/;
const ENCODED_DOT_REGEX = /(?:%2e|\.){2}(?:%2f|%5c|[/\\])/i;
const DOUBLE_ENCODED_REGEX = /%252e%252e/i;

/**
 * Checks whether a given string contains relative directory traversal escapes.
 */
export function isPathTraversal(pathStr: string): boolean {
  if (!pathStr || typeof pathStr !== 'string') return false;

  if (DIRECT_TRAVERSAL_REGEX.test(pathStr)) return true;
  if (ENCODED_DOT_REGEX.test(pathStr)) return true;
  if (DOUBLE_ENCODED_REGEX.test(pathStr)) return true;

  return false;
}

/**
 * Detailed inspection of path traversal depth and pattern.
 */
export function detectPathTraversal(pathStr: string): PathTraversalDetection {
  if (!pathStr || typeof pathStr !== 'string') {
    return { hasTraversal: false, depth: 0, rawPath: pathStr || '' };
  }

  // Count occurrences of .. segments
  const matches = pathStr.match(/(?:\.\.[/\\]|\.\.$|[/\\]\.\.)/g);
  const depth = matches ? matches.length : 0;
  const hasDirect = isPathTraversal(pathStr);

  if (hasDirect || depth > 0) {
    return {
      hasTraversal: true,
      depth: Math.max(depth, 1),
      rawPath: pathStr,
      matchedPattern: '.. directory escape',
      reason: `Relative path traversal escape sequence detected (depth: ${Math.max(depth, 1)})`,
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
