/**
 * Zero-Trust Destructive Command Interceptor.
 * Prevents recursive deletion targeting root, home, or critical system paths (rm -rf, shred, rmdir /s).
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';
import { parseShellCommand } from './tokenizer.js';

export interface DestructiveDetectionResult {
  isDestructive: boolean;
  reason?: string;
  detectedPattern?: string;
}

const CRITICAL_ROOT_TARGETS = new Set([
  '/',
  '/*',
  '/.*',
  '//',
  '///',
  '~',
  '~/*',
  '$HOME',
  '${HOME}',
  '.',
  '..',
  '*',
  'c:\\',
  'c:/',
  '\\',
  '%USERPROFILE%',
  '%SYSTEMROOT%'
]);

const CRITICAL_SYSTEM_DIRS = [
  '/etc',
  '/boot',
  '/sys',
  '/proc',
  '/dev',
  '/bin',
  '/sbin',
  '/usr',
  '/lib',
  '/var',
  'c:\\windows',
  'c:\\program files'
];

/**
 * Normalizes a path string, stripping surrounding quotes, trailing slashes, and backslash escapes.
 */
function normalizePath(rawPath: string): string {
  let cleaned = rawPath.trim();
  // Strip quotes
  cleaned = cleaned.replace(/^["']|["']$/g, '');
  // Unescape backslash escapes (e.g. \/ -> /)
  cleaned = cleaned.replace(/\\([/~$.])/g, '$1');
  // Lowercase for comparison
  cleaned = cleaned.toLowerCase();
  // Collapse multiple slashes
  cleaned = cleaned.replace(/\/+/g, '/');
  // Strip trailing slash unless it's just root "/"
  if (cleaned.length > 1 && cleaned.endsWith('/')) {
    cleaned = cleaned.slice(0, -1);
  }
  return cleaned;
}

/**
 * Analyzes a raw shell command line for catastrophic recursive deletion attempts.
 */
export function detectDestructiveDeletion(commandLine: string): DestructiveDetectionResult {
  const parsed = parseShellCommand(commandLine);

  // Check all pipeline stages
  for (const stage of parsed.stages) {
    let effectiveExec = stage.executable.toLowerCase();
    let effectiveArgs = [...stage.args];
    let effectiveFlags = [...stage.flags];

    // Unwrap privilege escalation / command execution wrappers (sudo, doas, nohup, xargs, env, exec)
    if (['sudo', 'doas', 'nohup', 'xargs', 'env', 'exec'].includes(effectiveExec)) {
      const innerIdx = stage.args.findIndex((a) => !a.startsWith('-') && !a.includes('='));
      if (innerIdx !== -1) {
        effectiveExec = stage.args[innerIdx].toLowerCase();
        effectiveArgs = stage.args.slice(innerIdx + 1);
        effectiveFlags = effectiveArgs.filter((a) => a.startsWith('-'));
      }
    }

    // 1. Detect POSIX rm
    if (effectiveExec === 'rm' || effectiveExec.endsWith('/rm')) {
      const flags = effectiveFlags.map((f) => f.toLowerCase());

      // Check if recursive deletion flag is present: -r, -R, --recursive, or combined flag containing 'r'
      const isRecursive = flags.some((f) => {
        if (f === '-r' || f === '-r' || f === '--recursive') return true;
        if (f.startsWith('-') && !f.startsWith('--') && f.includes('r')) return true;
        return false;
      });

      if (isRecursive) {
        // Collect target paths (arguments that are not flags)
        const targets = effectiveArgs.filter((a) => !a.startsWith('-'));

        for (const target of targets) {
          const norm = normalizePath(target);

          // Check if target matches root or home directory
          if (CRITICAL_ROOT_TARGETS.has(norm) || CRITICAL_ROOT_TARGETS.has(target)) {
            return {
              isDestructive: true,
              reason: `Recursive deletion targeting critical directory: "${target}"`,
              detectedPattern: `rm ${effectiveFlags.join(' ')} ${target}`,
            };
          }

          // Check if target is a core system root subfolder
          for (const sysDir of CRITICAL_SYSTEM_DIRS) {
            if (norm === sysDir || norm === `${sysDir}/*` || norm.startsWith(`${sysDir}/`)) {
              return {
                isDestructive: true,
                reason: `Recursive deletion targeting critical system directory: "${target}"`,
                detectedPattern: `rm ${effectiveFlags.join(' ')} ${target}`,
              };
            }
          }
        }
      }
    }

    // 2. Detect shred targeting raw disks or entire filesystems
    if (effectiveExec === 'shred' || effectiveExec.endsWith('/shred')) {
      const targets = effectiveArgs.filter((a) => !a.startsWith('-'));
      for (const target of targets) {
        const norm = normalizePath(target);
        if (norm.startsWith('/dev/sd') || norm.startsWith('/dev/nvme') || norm.startsWith('/dev/hd') || norm === '/' || norm.startsWith('/etc')) {
          return {
            isDestructive: true,
            reason: `Shred command targeting critical block device or system path: "${target}"`,
            detectedPattern: `shred ${effectiveArgs.join(' ')}`,
          };
        }
      }
    }

    // 3. Detect Windows rmdir / rd recursive quiet deletion (rmdir /s /q)
    if (effectiveExec === 'rmdir' || effectiveExec === 'rd') {
      const lowerArgs = effectiveArgs.map((a) => a.toLowerCase());
      const hasRecursive = lowerArgs.includes('/s') || lowerArgs.some((a) => a.includes('/s'));
      if (hasRecursive) {
        const targets = effectiveArgs.filter((a) => !a.startsWith('/'));
        for (const target of targets) {
          const norm = normalizePath(target);
          if (CRITICAL_ROOT_TARGETS.has(norm) || norm === 'c:' || norm === 'c:\\') {
            return {
              isDestructive: true,
              reason: `Windows recursive rmdir targeting root filesystem: "${target}"`,
              detectedPattern: `rmdir ${effectiveArgs.join(' ')}`,
            };
          }
        }
      }
    }
  }

  // Also check nested subshells ($(..), `..`)
  for (const sub of parsed.allSubshells) {
    const subResult = detectDestructiveDeletion(sub);
    if (subResult.isDestructive) {
      return subResult;
    }
  }

  return { isDestructive: false };
}

/**
 * Creates the standard SentinelRule to strictly block destructive deletion commands.
 */
export function createDestructiveDeletionRule(): SentinelRule {
  return {
    id: 'block-destructive-deletion',
    name: 'Block Destructive File Deletion (rm -rf, shred, rmdir)',
    category: 'shell',
    priority: 950,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      // Extract command string from any standard parameter keys
      const candidateCommands: string[] = [];
      if (typeof ctx.params?.cmd === 'string') candidateCommands.push(ctx.params.cmd);
      if (typeof ctx.params?.command === 'string') candidateCommands.push(ctx.params.command);
      if (typeof ctx.params?.script === 'string') candidateCommands.push(ctx.params.script);
      if (typeof ctx.params?.input === 'string') candidateCommands.push(ctx.params.input);

      for (const cmd of candidateCommands) {
        const detection = detectDestructiveDeletion(cmd);
        if (detection.isDestructive) {
          return {
            ruleId: 'block-destructive-deletion',
            ruleName: 'Block Destructive File Deletion (rm -rf, shred, rmdir)',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: detection.reason || 'Destructive file deletion detected',
            detectedPattern: detection.detectedPattern,
          };
        }
      }

      return null;
    },
  };
}
