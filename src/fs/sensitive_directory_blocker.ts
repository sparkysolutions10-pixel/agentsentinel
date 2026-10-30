/**
 * Sensitive System Directory and Credential File Read Blocker.
 * Intercepts unauthorized file read and access attempts targeting operating system
 * critical directories (/etc, /proc, /sys, /var/run, C:\Windows\System32) and
 * user credential stores (~/.ssh, ~/.aws, ~/.kube).
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';
import { DEFAULT_FS_PATH_FIELDS, normalizePathEncodings } from './path_traversal.js';

export type SensitivePathCategory =
  | 'credentials'
  | 'system_config'
  | 'kernel_proc'
  | 'windows_system';

export interface SensitivePathInspection {
  isSensitive: boolean;
  category?: SensitivePathCategory;
  matchedTarget?: string;
  normalizedPath: string;
  reason?: string;
}

// Regex patterns for sensitive system directories across POSIX and Windows
const SENSITIVE_PATH_PATTERNS: Array<{
  pattern: RegExp;
  category: SensitivePathCategory;
  name: string;
}> = [
  // SSH and user credentials
  {
    pattern: /(?:^|[/\\])(?:\.ssh|id_rsa|id_ecdsa|id_ed25519|id_dsa|authorized_keys|known_hosts)(?:[/\\]|$)/i,
    category: 'credentials',
    name: 'User SSH Key & Credentials',
  },
  {
    pattern: /(?:^|[/\\])(?:\.aws[/\\]credentials|\.kube[/\\]config|\.docker[/\\]config\.json)(?:[/\\]|$)/i,
    category: 'credentials',
    name: 'Cloud & Container Secrets',
  },
  // Linux / Unix system configurations & shadow
  {
    pattern: /^\/(?:etc|private\/etc)(?:[/\\]|$)/i,
    category: 'system_config',
    name: '/etc System Configuration',
  },
  {
    pattern: /^\/(?:proc|sys)(?:[/\\]|$)/i,
    category: 'kernel_proc',
    name: '/proc or /sys Virtual Kernel Filesystem',
  },
  {
    pattern: /^\/var\/(?:run|shadow)(?:[/\\]|$)/i,
    category: 'system_config',
    name: '/var/run or /var/shadow Runtime State',
  },
  {
    pattern: /^\/root(?:[/\\]|$)/i,
    category: 'system_config',
    name: '/root Administrator Home Directory',
  },
  // Windows critical directories
  {
    pattern: /^(?:[a-zA-Z]:)?[/\\](?:windows|winnt)[/\\](?:system32|syswow64|config)(?:[/\\]|$)/i,
    category: 'windows_system',
    name: 'Windows System32/SysWOW64 Directory',
  },
  {
    pattern: /^(?:[a-zA-Z]:)?[/\\](?:windows|winnt)[/\\]system32[/\\]config[/\\](?:sam|system|security)(?:[/\\]|$)/i,
    category: 'windows_system',
    name: 'Windows Registry SAM/SYSTEM Database',
  },
];

/**
 * Normalizes slashes and resolves path before checking against sensitive directories.
 */
export function normalizeSystemPath(rawPath: string): string {
  if (!rawPath || typeof rawPath !== 'string') return '';
  const decoded = normalizePathEncodings(rawPath.trim());
  return decoded;
}

/**
 * Checks whether a given path references sensitive system files or directories.
 */
export function isSensitiveSystemPath(pathStr: string): boolean {
  return inspectSensitivePath(pathStr).isSensitive;
}

/**
 * Detailed inspection of sensitive system path access.
 */
export function inspectSensitivePath(pathStr: string): SensitivePathInspection {
  const normalized = normalizeSystemPath(pathStr);
  if (!normalized) {
    return { isSensitive: false, normalizedPath: '' };
  }

  for (const { pattern, category, name } of SENSITIVE_PATH_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        isSensitive: true,
        category,
        matchedTarget: name,
        normalizedPath: normalized,
        reason: `Target path '${pathStr}' resides in restricted system location: ${name}`,
      };
    }
  }

  return {
    isSensitive: false,
    normalizedPath: normalized,
  };
}

export interface SensitiveDirectoryBlockerOptions {
  pathFields?: string[];
  customBlockedPatterns?: RegExp[];
}

/**
 * Creates SentinelRule to block reads/access to sensitive operating system directories.
 */
export function createSensitiveDirectoryBlockerRule(
  options?: SensitiveDirectoryBlockerOptions
): SentinelRule {
  const pathFields = options?.pathFields || DEFAULT_FS_PATH_FIELDS;
  const customPatterns = options?.customBlockedPatterns || [];

  return {
    id: 'fs-block-sensitive-system-dirs',
    name: 'Block Access to Sensitive System Directories and Credentials',
    category: 'fs',
    priority: 940,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      if (!ctx.params || typeof ctx.params !== 'object') {
        return null;
      }

      for (const field of pathFields) {
        const val = ctx.params[field];
        if (typeof val === 'string' && val.trim() !== '') {
          // Check standard sensitive paths
          const inspection = inspectSensitivePath(val);
          if (inspection.isSensitive) {
            return {
              ruleId: 'fs-block-sensitive-system-dirs',
              ruleName: 'Block Access to Sensitive System Directories and Credentials',
              severity: 'critical',
              verdict: Verdict.BLOCK,
              reason: `Unauthorized access to sensitive system directory intercepted: ${inspection.reason}`,
            };
          }

          // Check custom patterns
          for (const customRegex of customPatterns) {
            if (customRegex.test(val)) {
              return {
                ruleId: 'fs-block-sensitive-system-dirs',
                ruleName: 'Block Access to Sensitive System Directories and Credentials',
                severity: 'critical',
                verdict: Verdict.BLOCK,
                reason: `Target path '${val}' matched custom sensitive directory rule (${customRegex.source})`,
              };
            }
          }
        }
      }

      return null;
    },
  };
}

export const sensitiveDirectoryBlockerRule: SentinelRule = createSensitiveDirectoryBlockerRule();
