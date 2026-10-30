/**
 * Allowed Workspace Directory Jail Validator.
 * Confines all filesystem read, write, edit, and delete operations strictly
 * within specified allowed workspace root boundaries across POSIX and Windows.
 */

import path from 'path';
import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';
import { DEFAULT_FS_PATH_FIELDS, normalizePathEncodings } from './path_traversal.js';

export interface WorkspaceJailInspection {
  isAllowed: boolean;
  resolvedPath: string;
  matchingRoot?: string;
  reason?: string;
}

/**
 * Normalizes a path string for cross-platform comparison.
 * Standardizes separators to `/`, resolves drive letter casing on Windows,
 * and strips trailing slashes.
 */
export function normalizeJailPath(p: string): string {
  if (!p || typeof p !== 'string') return '';
  const decoded = normalizePathEncodings(p.trim());

  // Replace backslashes with forward slashes
  let normalized = decoded.replace(/\\/g, '/');

  // Normalize Windows drive letter to lowercase (e.g. C:/ -> c:/)
  if (/^[a-zA-Z]:\//.test(normalized)) {
    normalized = normalized[0].toLowerCase() + normalized.slice(1);
  }

  // Remove redundant slashes
  normalized = normalized.replace(/\/+/g, '/');

  // Strip trailing slash unless root
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}

/**
 * Checks whether targetPath resolves strictly within one of the allowed roots.
 */
export function isInsideWorkspaceJail(
  targetPath: string,
  allowedRoots: string[],
  baseDir?: string
): boolean {
  return inspectWorkspaceJail(targetPath, allowedRoots, baseDir).isAllowed;
}

/**
 * Inspects a target path against the allowed workspace roots.
 */
export function inspectWorkspaceJail(
  targetPath: string,
  allowedRoots: string[],
  baseDir?: string
): WorkspaceJailInspection {
  if (!targetPath || typeof targetPath !== 'string') {
    return { isAllowed: false, resolvedPath: '', reason: 'Empty or invalid target path' };
  }

  if (!allowedRoots || allowedRoots.length === 0) {
    return { isAllowed: false, resolvedPath: targetPath, reason: 'No allowed workspace roots defined' };
  }

  const effectiveBase = baseDir || (typeof process !== 'undefined' && process.cwd ? process.cwd() : '/');

  // Determine if target path is absolute (POSIX / or Windows C:/)
  const isPosixAbsolute = targetPath.startsWith('/');
  const isWinAbsolute = /^[a-zA-Z]:[/\\]/.test(targetPath);

  let normalizedTarget: string;
  if (isPosixAbsolute || isWinAbsolute) {
    normalizedTarget = normalizeJailPath(path.normalize(targetPath));
  } else {
    // Relative path: resolve against effectiveBase
    const normBase = normalizeJailPath(effectiveBase);
    const normRel = normalizeJailPath(targetPath);
    normalizedTarget = path.posix.normalize(normBase + '/' + normRel);
  }

  const targetWithoutDrive = normalizedTarget.replace(/^[a-zA-Z]:/, '');

  // Check against each allowed root
  for (const root of allowedRoots) {
    const normalizedRoot = normalizeJailPath(root);
    const rootWithoutDrive = normalizedRoot.replace(/^[a-zA-Z]:/, '');

    // 1. Direct match with drive
    if (normalizedTarget === normalizedRoot) {
      return { isAllowed: true, resolvedPath: normalizedTarget, matchingRoot: normalizedRoot };
    }

    const rootWithSlash = normalizedRoot.endsWith('/') ? normalizedRoot : normalizedRoot + '/';
    if (normalizedTarget.startsWith(rootWithSlash)) {
      return { isAllowed: true, resolvedPath: normalizedTarget, matchingRoot: normalizedRoot };
    }

    // 2. Cross-platform drive-agnostic match
    if (targetWithoutDrive === rootWithoutDrive) {
      return { isAllowed: true, resolvedPath: normalizedTarget, matchingRoot: normalizedRoot };
    }

    const rootWithoutDriveWithSlash = rootWithoutDrive.endsWith('/') ? rootWithoutDrive : rootWithoutDrive + '/';
    if (targetWithoutDrive.startsWith(rootWithoutDriveWithSlash)) {
      return { isAllowed: true, resolvedPath: normalizedTarget, matchingRoot: normalizedRoot };
    }
  }

  return {
    isAllowed: false,
    resolvedPath: normalizedTarget,
    reason: `Target path '${targetPath}' (${normalizedTarget}) escapes outside allowed workspace boundaries [${allowedRoots.join(', ')}]`,
  };
}

export interface WorkspaceJailGuardOptions {
  allowedRoots: string[];
  defaultBaseDir?: string;
  pathFields?: string[];
}

/**
 * Creates SentinelRule to enforce workspace directory jail.
 */
export function createWorkspaceJailGuardRule(options: WorkspaceJailGuardOptions): SentinelRule {
  const allowedRoots = options.allowedRoots;
  const baseDir = options.defaultBaseDir;
  const pathFields = options.pathFields || DEFAULT_FS_PATH_FIELDS;

  return {
    id: 'fs-workspace-jail-validator',
    name: 'Confine Filesystem Operations Within Workspace Jail Roots',
    category: 'fs',
    priority: 970,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      if (!ctx.params || typeof ctx.params !== 'object') {
        return null;
      }

      for (const field of pathFields) {
        const val = ctx.params[field];
        if (typeof val === 'string' && val.trim() !== '') {
          const inspection = inspectWorkspaceJail(val, allowedRoots, baseDir);
          if (!inspection.isAllowed) {
            return {
              ruleId: 'fs-workspace-jail-validator',
              ruleName: 'Confine Filesystem Operations Within Workspace Jail Roots',
              severity: 'critical',
              verdict: Verdict.BLOCK,
              reason: `Filesystem operation outside workspace jail intercepted: ${inspection.reason}`,
            };
          }
        }
      }

      return null;
    },
  };
}

export const defaultWorkspaceJailGuardRule: SentinelRule = createWorkspaceJailGuardRule({
  allowedRoots: typeof process !== 'undefined' && process.cwd ? [process.cwd()] : ['/workspace'],
});
