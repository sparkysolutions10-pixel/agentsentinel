/**
 * Shell Working Directory Path Confinement Guard.
 * Restricts shell execution working directory (`cwd`) to designated workspace roots,
 * blocking traversal escapes (`../`), root system directories, and unauthorized drives.
 */

import path from 'path';
import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export interface CwdConfinementOptions {
  allowedRoots?: string[];
  cwdFieldNames?: string[];
  blockUnspecifiedCwd?: boolean;
  defaultFallbackRoot?: string;
}

export interface CwdValidationResult {
  allowed: boolean;
  normalizedPath?: string;
  matchedRoot?: string;
  reason?: string;
}

export const DEFAULT_CWD_FIELDS = ['cwd', 'workingDir', 'working_dir', 'dir', 'directory'];

/**
 * Normalizes a path cleanly across Windows and POSIX boundaries.
 */
export function normalizePathCanonical(p: string): string {
  // Strip null bytes and control chars
  let cleaned = p.replace(/\0/g, '').trim();
  // Decode simple URL encoding if present
  try {
    cleaned = decodeURIComponent(cleaned);
  } catch {
    // Keep as is if decode fails
  }
  const resolved = path.resolve(cleaned);
  return path.normalize(resolved);
}

/**
 * Checks whether candidatePath is strictly located inside or identical to rootPath.
 */
export function isPathInsideRoot(candidatePath: string, rootPath: string): boolean {
  const normCandidate = normalizePathCanonical(candidatePath);
  const normRoot = normalizePathCanonical(rootPath);

  // Normalize case for Windows drive comparison
  const isWindows = process.platform === 'win32';
  const cCompare = isWindows ? normCandidate.toLowerCase() : normCandidate;
  const rCompare = isWindows ? normRoot.toLowerCase() : normRoot;

  if (cCompare === rCompare) {
    return true;
  }

  // Ensure root comparison ends with separator to prevent prefix collision (e.g. /app vs /app-data)
  const rPrefix = rCompare.endsWith(path.sep) ? rCompare : rCompare + path.sep;
  return cCompare.startsWith(rPrefix);
}

/**
 * Validates a working directory path against a list of allowed workspace roots.
 */
export function validateWorkingDir(
  candidateCwd: string,
  allowedRoots: string[]
): CwdValidationResult {
  if (!candidateCwd || typeof candidateCwd !== 'string') {
    return {
      allowed: false,
      reason: 'Empty or invalid working directory parameter',
    };
  }

  const normalized = normalizePathCanonical(candidateCwd);

  for (const root of allowedRoots) {
    if (isPathInsideRoot(normalized, root)) {
      return {
        allowed: true,
        normalizedPath: normalized,
        matchedRoot: root,
      };
    }
  }

  return {
    allowed: false,
    normalizedPath: normalized,
    reason: `Target directory [${normalized}] escapes designated workspace boundaries: [${allowedRoots.join(', ')}]`,
  };
}

/**
 * Creates the standard SentinelRule to confine shell execution cwd.
 */
export function createCwdConfinementRule(options?: CwdConfinementOptions): SentinelRule {
  const allowedRoots = options?.allowedRoots && options.allowedRoots.length > 0
    ? options.allowedRoots
    : [process.cwd()];

  const fields = options?.cwdFieldNames || DEFAULT_CWD_FIELDS;
  const blockUnspecified = options?.blockUnspecifiedCwd ?? false;

  return {
    id: 'shell-cwd-confinement',
    name: 'Confine Shell Working Directory to Workspace Roots',
    category: 'shell',
    priority: 870,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const toolName = (ctx.toolName || '').toLowerCase();
      const isShellTool =
        toolName.includes('bash') ||
        toolName.includes('sh') ||
        toolName.includes('powershell') ||
        toolName.includes('cmd') ||
        toolName.includes('command') ||
        toolName.includes('exec') ||
        ctx.category === 'shell' ||
        typeof ctx.params?.command === 'string' ||
        typeof ctx.params?.cmd === 'string' ||
        typeof ctx.params?.commandLine === 'string';

      if (!isShellTool) {
        return null;
      }

      // Find cwd field
      let candidateCwd: string | null = null;
      for (const field of fields) {
        if (ctx.params && typeof ctx.params[field] === 'string' && ctx.params[field].trim() !== '') {
          candidateCwd = ctx.params[field];
          break;
        }
      }

      // If no cwd specified
      if (candidateCwd === null) {
        if (blockUnspecified) {
          return {
            ruleId: 'shell-cwd-confinement',
            ruleName: 'Confine Shell Working Directory to Workspace Roots',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: 'Execution missing explicit working directory parameter while strict confinement is enabled',
          };
        }
        return null;
      }

      const result = validateWorkingDir(candidateCwd, allowedRoots);
      if (!result.allowed) {
        return {
          ruleId: 'shell-cwd-confinement',
          ruleName: 'Confine Shell Working Directory to Workspace Roots',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: result.reason || 'Working directory traversal outside workspace boundary blocked',
        };
      }

      return null;
    },
  };
}

export const cwdConfinementRule: SentinelRule = createCwdConfinementRule();
