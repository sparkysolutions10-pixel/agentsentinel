/**
 * Disk Formatting & Raw Block Device Wipe Detector.
 * Prevents catastrophic raw disk writes, filesystem creation, and partition table destruction (mkfs, dd of=/dev/*, fdisk, wipefs).
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';
import { parseShellCommand } from './tokenizer.js';

export interface DiskWipeDetectionResult {
  isDiskWipe: boolean;
  reason?: string;
  detectedPattern?: string;
}

const RAW_DEVICE_PREFIXES = [
  '/dev/sd',
  '/dev/nvme',
  '/dev/hd',
  '/dev/vd',
  '/dev/mapper/',
  '/dev/loop',
  '/dev/mmcblk',
  '\\\\.\\physicaldrive',
];

const DISK_MANIPULATION_TOOLS = new Set([
  'fdisk',
  'gdisk',
  'parted',
  'sfdisk',
  'cfdisk',
  'wipefs',
  'blkdiscard',
]);

/**
 * Checks if a target string points to a raw storage block device or partition.
 */
export function isRawBlockDevice(target: string): boolean {
  const lower = target.toLowerCase().trim().replace(/^["']|["']$/g, '');
  return RAW_DEVICE_PREFIXES.some((prefix) => lower.startsWith(prefix));
}

/**
 * Analyzes a raw shell command line for catastrophic disk formatting or block device wipe attempts.
 */
export function detectDiskWipe(commandLine: string): DiskWipeDetectionResult {
  const parsed = parseShellCommand(commandLine);

  for (const stage of parsed.stages) {
    let effectiveExec = stage.executable.toLowerCase();
    let effectiveArgs = [...stage.args];

    // Unwrap privilege escalation wrappers (sudo, doas, nohup, xargs, env, exec)
    if (['sudo', 'doas'].includes(effectiveExec)) {
      let idx = 0;
      while (idx < stage.args.length) {
        const arg = stage.args[idx];
        if (arg === '-u' || arg === '-g' || arg === '-h' || arg === '-p') {
          idx += 2;
          continue;
        }
        if (arg.startsWith('-')) {
          idx++;
          continue;
        }
        effectiveExec = arg.toLowerCase();
        effectiveArgs = stage.args.slice(idx + 1);
        break;
      }
    } else if (['nohup', 'xargs', 'env', 'exec'].includes(effectiveExec)) {
      const innerIdx = stage.args.findIndex((a) => !a.startsWith('-') && !a.includes('='));
      if (innerIdx !== -1) {
        effectiveExec = stage.args[innerIdx].toLowerCase();
        effectiveArgs = stage.args.slice(innerIdx + 1);
      }
    }

    // Check for inline script execution (bash -c, sh -c)
    if (['bash', 'sh', 'zsh', 'ksh'].includes(effectiveExec)) {
      const cIndex = effectiveArgs.indexOf('-c');
      if (cIndex !== -1 && cIndex + 1 < effectiveArgs.length) {
        const inlineScript = effectiveArgs[cIndex + 1];
        const inlineResult = detectDiskWipe(inlineScript);
        if (inlineResult.isDiskWipe) {
          return inlineResult;
        }
      }
    }

    // 1. Detect mkfs variants (mkfs, mkfs.ext4, mkfs.xfs, mkfs.btrfs, mkfs.vfat, etc.)
    if (effectiveExec === 'mkfs' || effectiveExec.startsWith('mkfs.') || effectiveExec.endsWith('/mkfs') || effectiveExec.includes('/mkfs.')) {
      return {
        isDiskWipe: true,
        reason: `Filesystem formatting command detected: "${effectiveExec}"`,
        detectedPattern: `${effectiveExec} ${effectiveArgs.join(' ')}`,
      };
    }

    // 2. Detect dd writing directly to raw block devices (of=/dev/sd*, of=/dev/nvme*, etc.)
    if (effectiveExec === 'dd' || effectiveExec.endsWith('/dd')) {
      for (const arg of effectiveArgs) {
        const lower = arg.toLowerCase();
        if (lower.startsWith('of=')) {
          const target = lower.slice(3);
          if (isRawBlockDevice(target)) {
            return {
              isDiskWipe: true,
              reason: `dd write directly targeting raw block device: "${target}"`,
              detectedPattern: `dd ${effectiveArgs.join(' ')}`,
            };
          }
        }
      }
    }

    // 3. Detect partition table manipulation and wiping tools (fdisk, parted, wipefs, blkdiscard)
    if (DISK_MANIPULATION_TOOLS.has(effectiveExec)) {
      return {
        isDiskWipe: true,
        reason: `Low-level disk manipulation tool detected: "${effectiveExec}"`,
        detectedPattern: `${effectiveExec} ${effectiveArgs.join(' ')}`,
      };
    }

    // 4. Detect Windows format.com command targeting disk volumes
    if (effectiveExec === 'format' || effectiveExec === 'format.com') {
      const hasDriveArg = effectiveArgs.some((a) => /^[a-zA-Z]:/.test(a));
      if (hasDriveArg) {
        return {
          isDiskWipe: true,
          reason: `Windows disk format command detected: "${effectiveExec}"`,
          detectedPattern: `format ${effectiveArgs.join(' ')}`,
        };
      }
    }

    // 5. Detect raw file redirects targeting block devices (e.g. cat image > /dev/sda)
    for (const redirect of stage.redirects) {
      if (isRawBlockDevice(redirect)) {
        return {
          isDiskWipe: true,
          reason: `Direct stream redirection to raw block device: "${redirect}"`,
          detectedPattern: `${effectiveExec} > ${redirect}`,
        };
      }
    }
  }

  // Also check nested subshells ($(..), `..`)
  for (const sub of parsed.allSubshells) {
    const subResult = detectDiskWipe(sub);
    if (subResult.isDiskWipe) {
      return subResult;
    }
  }

  return { isDiskWipe: false };
}

/**
 * Creates the standard SentinelRule to strictly block disk formatting and block device wipes.
 */
export function createDiskWipeRule(): SentinelRule {
  return {
    id: 'block-disk-wipe',
    name: 'Block Disk Formatting and Raw Device Wipe (mkfs, dd, fdisk, wipefs)',
    category: 'shell',
    priority: 940,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const candidateCommands: string[] = [];
      if (typeof ctx.params?.cmd === 'string') candidateCommands.push(ctx.params.cmd);
      if (typeof ctx.params?.command === 'string') candidateCommands.push(ctx.params.command);
      if (typeof ctx.params?.script === 'string') candidateCommands.push(ctx.params.script);
      if (typeof ctx.params?.input === 'string') candidateCommands.push(ctx.params.input);

      for (const cmd of candidateCommands) {
        const detection = detectDiskWipe(cmd);
        if (detection.isDiskWipe) {
          return {
            ruleId: 'block-disk-wipe',
            ruleName: 'Block Disk Formatting and Raw Device Wipe (mkfs, dd, fdisk, wipefs)',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: detection.reason || 'Raw block device wipe or disk formatting detected',
            detectedPattern: detection.detectedPattern,
          };
        }
      }

      return null;
    },
  };
}
