/**
 * System Shutdown, Reboot, and Halt Command Blocker.
 * Identifies and intercepts destructive operating system level power manipulation
 * commands that trigger machine shutdown, restart, poweroff, or runlevel halt
 * across Linux, macOS, and Windows environments.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export type ShutdownAction = 'shutdown' | 'reboot' | 'halt' | 'poweroff';
export type OSPlatform = 'linux' | 'windows' | 'macos' | 'universal';

export interface ShutdownDetectionResult {
  isShutdown: boolean;
  action?: ShutdownAction;
  platform?: OSPlatform;
  reason?: string;
  detectedPattern?: string;
}

// 1. Classic POSIX shutdown: shutdown [-h|-r|-P|-c] [time] or shutdown now
const SHUTDOWN_POSIX_REGEX = /(?:^|[;&|]\s*)(?:sudo\s+)?(?:\/sbin\/|\/usr\/sbin\/)?shutdown(?:\s+(?:-[a-zA-Z0-9]+|--[a-zA-Z0-9-]+|\+[0-9]+|[0-9]{1,2}:[0-9]{2}|now))*(\s|$)/i;

// 2. Direct reboot, halt, poweroff: reboot [-f|-p], poweroff [-f], halt [-p]
const REBOOT_POSIX_REGEX = /(?:^|[;&|]\s*)(?:sudo\s+)?(?:\/sbin\/|\/usr\/sbin\/)?reboot(?:\s+-[a-zA-Z0-9]+|\s+--[a-zA-Z0-9-]+)*(?:\s|$)/i;
const POWEROFF_POSIX_REGEX = /(?:^|[;&|]\s*)(?:sudo\s+)?(?:\/sbin\/|\/usr\/sbin\/)?poweroff(?:\s+-[a-zA-Z0-9]+|\s+--[a-zA-Z0-9-]+)*(?:\s|$)/i;
const HALT_POSIX_REGEX = /(?:^|[;&|]\s*)(?:sudo\s+)?(?:\/sbin\/|\/usr\/sbin\/)?halt(?:\s+-[a-zA-Z0-9]+|\s+--[a-zA-Z0-9-]+)*(?:\s|$)/i;

// 3. Systemd systemctl targets: systemctl (poweroff|reboot|halt|emergency)
const SYSTEMCTL_SHUTDOWN_REGEX = /(?:^|[;&|]\s*)(?:sudo\s+)?systemctl\s+(?:-[a-zA-Z0-9-]+\s+)*(poweroff|reboot|halt|emergency|isolate\s+(?:rescue|emergency)\.target)(?:\s|$)/i;

// 4. SysVinit / Telinit runlevels 0 and 6: init 0, init 6, telinit 0, telinit 6
const INIT_RUNLEVEL_REGEX = /(?:^|[;&|]\s*)(?:sudo\s+)?(?:init|telinit)\s+([06])(?:\s|$)/i;

// 5. Windows shutdown utility: shutdown [/s|/r|/p|/h] or shutdown.exe
const WINDOWS_SHUTDOWN_REGEX = /(?:^|[;&|]\s*)(?:shutdown\.exe\s*.*|shutdown\s+.*?(?:\/[srph]))(?:\s|$)/i;

// 6. PowerShell Cmdlets: Stop-Computer, Restart-Computer
const POWERSHELL_POWER_REGEX = /(?:^|[;&|]\s*)(Stop-Computer|Restart-Computer)(?:\s+-[a-zA-Z0-9-]+|\s+-[a-zA-Z0-9:]+)*(?:\s|$)/i;

// 7. macOS osascript shut down / restart
const MACOS_OSASCRIPT_SHUTDOWN = /osascript\s+.*?(?:shut\s+down|restart)/i;

/**
 * Analyzes command line strings for shutdown, reboot, and power state manipulation.
 */
export function detectShutdownCommand(rawCommand: string): ShutdownDetectionResult {
  if (!rawCommand || typeof rawCommand !== 'string') {
    return { isShutdown: false };
  }

  // Skip benign queries or flags like shutdown --help / man shutdown
  if (/shutdown\s+(?:--help|-h\s*--help|\/help|\/\?)/i.test(rawCommand)) {
    return { isShutdown: false };
  }

  // 1. Windows shutdown utility (e.g. shutdown /s /t 0)
  const winMatch = rawCommand.match(WINDOWS_SHUTDOWN_REGEX);
  if (winMatch) {
    const isReboot = /\/r|-r/i.test(winMatch[0]);
    return {
      isShutdown: true,
      action: isReboot ? 'reboot' : 'shutdown',
      platform: 'windows',
      reason: `Windows system ${isReboot ? 'restart' : 'shutdown'} command detected via shutdown.exe`,
      detectedPattern: winMatch[0].trim(),
    };
  }

  // 2. PowerShell Stop-Computer / Restart-Computer
  const psMatch = rawCommand.match(POWERSHELL_POWER_REGEX);
  if (psMatch) {
    const isReboot = psMatch[1].toLowerCase() === 'restart-computer';
    return {
      isShutdown: true,
      action: isReboot ? 'reboot' : 'shutdown',
      platform: 'windows',
      reason: `PowerShell ${isReboot ? 'system restart' : 'computer shutdown'} cmdlet detected: [${psMatch[1]}]`,
      detectedPattern: psMatch[0].trim(),
    };
  }

  // 3. Systemd systemctl poweroff/reboot/halt
  const systemctlMatch = rawCommand.match(SYSTEMCTL_SHUTDOWN_REGEX);
  if (systemctlMatch) {
    const targetAction = systemctlMatch[1].toLowerCase().includes('reboot') ? 'reboot' : 'shutdown';
    return {
      isShutdown: true,
      action: targetAction,
      platform: 'linux',
      reason: `Systemd power state transition detected via systemctl [${systemctlMatch[1]}]`,
      detectedPattern: systemctlMatch[0].trim(),
    };
  }

  // 4. SysVinit / telinit runlevels 0 (halt) or 6 (reboot)
  const initMatch = rawCommand.match(INIT_RUNLEVEL_REGEX);
  if (initMatch) {
    const runlevel = initMatch[1];
    const isReboot = runlevel === '6';
    return {
      isShutdown: true,
      action: isReboot ? 'reboot' : 'halt',
      platform: 'linux',
      reason: `SysVinit runlevel ${runlevel} (${isReboot ? 'reboot' : 'halt/shutdown'}) invocation detected`,
      detectedPattern: initMatch[0].trim(),
    };
  }

  // 5. Direct POSIX reboot
  const rebootMatch = rawCommand.match(REBOOT_POSIX_REGEX);
  if (rebootMatch) {
    return {
      isShutdown: true,
      action: 'reboot',
      platform: 'linux',
      reason: 'Linux/POSIX system reboot command detected',
      detectedPattern: rebootMatch[0].trim(),
    };
  }

  // 6. Direct POSIX poweroff
  const poweroffMatch = rawCommand.match(POWEROFF_POSIX_REGEX);
  if (poweroffMatch) {
    return {
      isShutdown: true,
      action: 'poweroff',
      platform: 'linux',
      reason: 'Linux/POSIX system poweroff command detected',
      detectedPattern: poweroffMatch[0].trim(),
    };
  }

  // 7. Direct POSIX halt
  const haltMatch = rawCommand.match(HALT_POSIX_REGEX);
  if (haltMatch) {
    return {
      isShutdown: true,
      action: 'halt',
      platform: 'linux',
      reason: 'Linux/POSIX system halt command detected',
      detectedPattern: haltMatch[0].trim(),
    };
  }

  // 8. macOS osascript shutdown / restart
  const macMatch = rawCommand.match(MACOS_OSASCRIPT_SHUTDOWN);
  if (macMatch) {
    const isReboot = /restart/i.test(macMatch[0]);
    return {
      isShutdown: true,
      action: isReboot ? 'reboot' : 'shutdown',
      platform: 'macos',
      reason: `macOS AppleScript GUI ${isReboot ? 'system restart' : 'system shutdown'} detected`,
      detectedPattern: macMatch[0].trim(),
    };
  }

  // 9. Generic POSIX shutdown command
  const posixShutdownMatch = rawCommand.match(SHUTDOWN_POSIX_REGEX);
  if (posixShutdownMatch) {
    const isReboot = /-r/i.test(posixShutdownMatch[0]);
    return {
      isShutdown: true,
      action: isReboot ? 'reboot' : 'shutdown',
      platform: 'linux',
      reason: `POSIX system ${isReboot ? 'reboot' : 'shutdown'} sequence initiated`,
      detectedPattern: posixShutdownMatch[0].trim(),
    };
  }

  return { isShutdown: false };
}

/**
 * Creates the standard SentinelRule to strictly block system shutdown and reboot commands.
 */
export function createShutdownBlockerRule(): SentinelRule {
  return {
    id: 'block-system-shutdown-reboot',
    name: 'Block System Shutdown & Reboot Commands',
    category: 'shell',
    priority: 950,
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
        const detection = detectShutdownCommand(cmd);
        if (detection.isShutdown) {
          return {
            ruleId: 'block-system-shutdown-reboot',
            ruleName: 'Block System Shutdown & Reboot Commands',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: detection.reason || 'Unauthorized system shutdown or reboot attempt intercepted',
            detectedPattern: detection.detectedPattern,
          };
        }
      }

      return null;
    },
  };
}

export const shutdownBlockerRule: SentinelRule = createShutdownBlockerRule();
