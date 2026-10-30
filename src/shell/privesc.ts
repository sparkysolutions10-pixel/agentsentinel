/**
 * Sudo & Privilege Escalation Command Detector.
 * Identifies and intercepts attempts to elevate execution privileges,
 * including sudo, su, doas, pkexec, SUID bit modification (chmod +s / 4755),
 * Linux capabilities (setcap), and Windows elevation (runas, Start-Process -Verb RunAs).
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export type ElevationMechanism =
  | 'sudo'
  | 'su'
  | 'doas'
  | 'pkexec'
  | 'suid_chmod'
  | 'capabilities'
  | 'windows_elevation';

export interface PrivEscDetectionResult {
  isPrivEsc: boolean;
  mechanism?: ElevationMechanism;
  reason?: string;
  detectedPattern?: string;
  elevatedTarget?: string;
}

export interface PrivEscRuleOptions {
  verdict?: Verdict.BLOCK | Verdict.CONFIRM;
  allowSudoUserWhitelist?: string[];
}

// 1. Sudo variations: sudo [flags] [cmd]
const SUDO_USER_FLAG_REGEX = /(?:^|\s)(?:-u\s*|--user\s+)([a-zA-Z0-9_-]+)/i;
const DIRECT_SUDO_INVOCATION = /(?:^|[;&|]\s*)sudo(?:\s+-[a-zA-Z0-9-]+|\s+--[a-zA-Z0-9-]+)*(?:\s+|$)/i;

// 2. su variations: su [-] [user] [-c "cmd"]
const SU_REGEX = /(?:^|[;&|]\s*)su\s+(?:-\s+|-[a-zA-Z]*l[a-zA-Z]*\s+)?([a-zA-Z0-9_-]+)?(?:\s+-c\s+["']?([^"']+)["']?)?/i;

// 3. doas variations: doas [-u user] cmd
const DOAS_REGEX = /(?:^|[;&|]\s*)doas\s+(?:-[a-zA-Z0-9-]+\s+)*(?:-u\s+([a-zA-Z0-9_-]+)\s+)?(.+?)(?=[;&|]|$)/i;

// 4. pkexec (PolicyKit elevation)
const PKEXEC_REGEX = /(?:^|[;&|]\s*)pkexec\s+(?:--user\s+([a-zA-Z0-9_-]+)\s+)?(.+?)(?=[;&|]|$)/i;

// 5. SUID / SGID chmod modification: chmod (u\+s|\+s|[0-7]?[4-7][0-7]{3})
const CHMOD_SUID_REGEX = /(?:^|[;&|]\s*)chmod\s+.*?(?:\+s|[ug]\+s|[4-7][0-7]{3})\s+([^\s;&|]+)/i;

// 6. Linux capabilities: setcap (e.g. setcap cap_setuid+ep /path)
const SETCAP_REGEX = /(?:^|[;&|]\s*)setcap\s+.*?(?:cap_setuid|cap_setgid|cap_sys_admin|cap_dac_override|\+ep)\s+([^\s;&|]+)/i;

// 7. Windows elevation: runas /user:Administrator or Start-Process -Verb RunAs
const WINDOWS_RUNAS_REGEX = /(?:^|[;&|]\s*)runas(?:\.exe)?\s+(?:\/user:([^\s]+)|\/noprofile|\/env|\/savecred)*(?:\s+.*)?/i;
const POWERSHELL_RUNAS_REGEX = /(?:^|[;&|]\s*)Start-Process\s+.*?-Verb\s+RunAs/i;

/**
 * Analyzes command line strings for privilege escalation vectors.
 */
export function detectPrivilegeEscalation(rawCommand: string): PrivEscDetectionResult {
  if (!rawCommand || typeof rawCommand !== 'string') {
    return { isPrivEsc: false };
  }

  // 1. SUID chmod modification
  const suidMatch = rawCommand.match(CHMOD_SUID_REGEX);
  if (suidMatch) {
    const targetFile = suidMatch[1];
    return {
      isPrivEsc: true,
      mechanism: 'suid_chmod',
      reason: `Unauthorized SUID/SGID bit elevation modification on binary "${targetFile}"`,
      detectedPattern: suidMatch[0].trim(),
      elevatedTarget: targetFile,
    };
  }

  // 2. Linux capabilities (setcap)
  const setcapMatch = rawCommand.match(SETCAP_REGEX);
  if (setcapMatch) {
    const targetBinary = setcapMatch[1];
    return {
      isPrivEsc: true,
      mechanism: 'capabilities',
      reason: `Linux capabilities privilege escalation via setcap on "${targetBinary}"`,
      detectedPattern: setcapMatch[0].trim(),
      elevatedTarget: targetBinary,
    };
  }

  // 3. pkexec
  const pkMatch = rawCommand.match(PKEXEC_REGEX);
  if (pkMatch) {
    const elevatedUser = pkMatch[1] || 'root';
    return {
      isPrivEsc: true,
      mechanism: 'pkexec',
      reason: `PolicyKit privilege elevation (pkexec) requested as user [${elevatedUser}]`,
      detectedPattern: pkMatch[0].trim(),
      elevatedTarget: elevatedUser,
    };
  }

  // 4. su
  const suMatch = rawCommand.match(SU_REGEX);
  if (suMatch) {
    const elevatedUser = suMatch[1] || 'root';
    return {
      isPrivEsc: true,
      mechanism: 'su',
      reason: `Subshell user switch (su) requested to elevated account [${elevatedUser}]`,
      detectedPattern: suMatch[0].trim(),
      elevatedTarget: elevatedUser,
    };
  }

  // 5. doas
  const doasMatch = rawCommand.match(DOAS_REGEX);
  if (doasMatch) {
    const elevatedUser = doasMatch[1] || 'root';
    return {
      isPrivEsc: true,
      mechanism: 'doas',
      reason: `Elevated privilege execution via doas as user [${elevatedUser}]`,
      detectedPattern: doasMatch[0].trim(),
      elevatedTarget: elevatedUser,
    };
  }

  // 6. sudo
  if (DIRECT_SUDO_INVOCATION.test(rawCommand)) {
    const userMatch = rawCommand.match(SUDO_USER_FLAG_REGEX);
    const elevatedUser = userMatch ? userMatch[1] : 'root';

    return {
      isPrivEsc: true,
      mechanism: 'sudo',
      reason: `Sudo privilege escalation requested${elevatedUser !== 'root' ? ` as [${elevatedUser}]` : ''}`,
      detectedPattern: rawCommand.trim(),
      elevatedTarget: elevatedUser,
    };
  }

  // 7. Windows runas / Start-Process -Verb RunAs
  const winRunAsMatch = rawCommand.match(WINDOWS_RUNAS_REGEX);
  if (winRunAsMatch) {
    const user = winRunAsMatch[1] || 'Administrator';
    return {
      isPrivEsc: true,
      mechanism: 'windows_elevation',
      reason: `Windows administrative elevation requested via runas as [${user}]`,
      detectedPattern: winRunAsMatch[0].trim(),
      elevatedTarget: user,
    };
  }

  const psRunAsMatch = rawCommand.match(POWERSHELL_RUNAS_REGEX);
  if (psRunAsMatch) {
    return {
      isPrivEsc: true,
      mechanism: 'windows_elevation',
      reason: 'Windows administrative UAC elevation requested via PowerShell Start-Process -Verb RunAs',
      detectedPattern: psRunAsMatch[0].trim(),
      elevatedTarget: 'Administrator',
    };
  }

  return { isPrivEsc: false };
}

/**
 * Creates the standard SentinelRule to intercept sudo and privilege elevation commands.
 */
export function createPrivilegeEscalationRule(options?: PrivEscRuleOptions): SentinelRule {
  const chosenVerdict = options?.verdict || Verdict.BLOCK;

  return {
    id: 'block-privilege-escalation',
    name: 'Block Sudo & Privilege Escalation Commands',
    category: 'shell',
    priority: 910,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const candidateCommands: string[] = [];
      if (typeof ctx.params?.cmd === 'string') candidateCommands.push(ctx.params.cmd);
      if (typeof ctx.params?.command === 'string') candidateCommands.push(ctx.params.command);
      if (typeof ctx.params?.commandLine === 'string') candidateCommands.push(ctx.params.commandLine);
      if (typeof ctx.params?.CommandLine === 'string') candidateCommands.push(ctx.params.CommandLine);
      if (typeof ctx.params?.script === 'string') candidateCommands.push(ctx.params.script);
      if (typeof ctx.params?.input === 'string') candidateCommands.push(ctx.params.input);

      for (const cmd of candidateCommands) {
        const detection = detectPrivilegeEscalation(cmd);
        if (detection.isPrivEsc) {
          // Check whitelist if configured
          if (
            options?.allowSudoUserWhitelist &&
            detection.elevatedTarget &&
            options.allowSudoUserWhitelist.includes(detection.elevatedTarget)
          ) {
            continue;
          }

          return {
            ruleId: 'block-privilege-escalation',
            ruleName: 'Block Sudo & Privilege Escalation Commands',
            severity: 'critical',
            verdict: chosenVerdict,
            reason: detection.reason || 'Unauthorized privilege elevation attempt detected',
            detectedPattern: detection.detectedPattern,
          };
        }
      }

      return null;
    },
  };
}

export const privilegeEscalationBlockerRule: SentinelRule = createPrivilegeEscalationRule();
