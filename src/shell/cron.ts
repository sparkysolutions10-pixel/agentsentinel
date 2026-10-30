/**
 * Crontab and Scheduled Task Manipulation Detector.
 * Identifies and intercepts unauthorized modifications to persistence mechanisms,
 * including crontab writes (-e, -r, stdin writes), cron spool directory tampering,
 * Windows schtasks creation/deletion, PowerShell Register-ScheduledTask, and systemd timers.
 * Allows safe read-only queries (crontab -l, schtasks /query, systemctl list-timers).
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export type PersistenceMechanism = 'crontab' | 'cron_spool' | 'schtasks' | 'systemd_timer' | 'at';
export type PersistenceAction = 'create' | 'edit' | 'delete' | 'overwrite';

export interface CronPersistenceResult {
  isPersistenceModification: boolean;
  mechanism?: PersistenceMechanism;
  action?: PersistenceAction;
  target?: string;
  reason?: string;
  detectedPattern?: string;
}

// 1. Crontab modifications: crontab -e, crontab -r, crontab -u user -e, crontab <file>, crontab -
const CRONTAB_MODIFY_REGEX = /(?:^|[;&|]\s*)(?:sudo\s+)?crontab(?:\s+-u\s+[a-zA-Z0-9_-]+)?\s+(?:-[a-zA-Z]*[er][a-zA-Z]*|-|\S+\.(?:tab|cron|txt|sh)|\/dev\/stdin)(?:\s|$)/i;
const CRONTAB_STDIN_PIPE_REGEX = /\|\s*(?:sudo\s+)?crontab(?:\s+-u\s+[a-zA-Z0-9_-]+)?(?:\s+-(?:[a-zA-Z0-9_-]*)|\s*$)/i;

// 2. Direct write / copy / move / append to cron spool and directories (/etc/cron.*, /var/spool/cron)
const CRON_DIR_WRITE_REGEX = /(?:>|>>|tee\s+(?:-a\s+)?|cp\s+.*|mv\s+.*|install\s+.*|cat\s+.*>)\s*["']?(\/(?:etc\/cron\.(?:d|daily|hourly|weekly|monthly)|etc\/crontab|var\/spool\/cron(?:\/crontabs)?)[^\s"';&|]*)/i;

// 3. Windows schtasks modification: schtasks [/create|/delete|/change]
const SCHTASKS_MODIFY_REGEX = /(?:^|[;&|]\s*)schtasks(?:\.exe)?\s+.*?(?:\/(?:create|delete|change)|-(?:create|delete|change))(?:\s|$)/i;

// 4. PowerShell ScheduledTask cmdlets: Register-ScheduledTask, Set-ScheduledTask, Unregister-ScheduledTask
const PS_SCHEDULED_TASK_REGEX = /(?:^|[;&|]\s*)(Register-ScheduledTask|Set-ScheduledTask|Unregister-ScheduledTask|New-ScheduledTaskAction)(?:\s+-[a-zA-Z0-9-]+|\s+.*)*(?:\s|$)/i;

// 5. Systemd timer creation / enabling
const SYSTEMD_TIMER_ENABLE_REGEX = /(?:^|[;&|]\s*)(?:sudo\s+)?systemctl\s+(?:enable|start)\s+.*?\S+\.timer(?:\s|$)/i;
const SYSTEMD_TIMER_WRITE_REGEX = /(?:>|>>|tee\s+(?:-a\s+)?)\s*["']?(\/(?:etc|lib|usr\/lib)\/systemd\/system\/[^\s"';&|]*\.timer)/i;

// 6. at / batch scheduling
const AT_SCHEDULE_REGEX = /(?:^|[;&|]\s*)(?:sudo\s+)?(?:at|batch)(?:\s+-(?:f|q|m|t)\s+\S+|\s+now|\s+[0-9]{1,2}:[0-9]{2}|\s+teatime|\s+noon|\s+tomorrow)(?:\s|$)/i;

/**
 * Analyzes command line strings for scheduled task persistence alterations.
 */
export function detectCronPersistence(rawCommand: string): CronPersistenceResult {
  if (!rawCommand || typeof rawCommand !== 'string') {
    return { isPersistenceModification: false };
  }

  // Allow safe read-only queries (e.g. crontab -l, schtasks /query)
  if (/(?:^|[;&|]\s*)(?:sudo\s+)?crontab(?:\s+-u\s+[a-zA-Z0-9_-]+)?\s+-l\b/i.test(rawCommand) &&
      !/(?:>|>>|\|)/.test(rawCommand)) {
    return { isPersistenceModification: false };
  }

  if (/(?:^|[;&|]\s*)schtasks(?:\.exe)?\s+\/query\b/i.test(rawCommand)) {
    return { isPersistenceModification: false };
  }

  // 1. Crontab modify (-e, -r, file write, stdin pipe)
  const cronMatch = rawCommand.match(CRONTAB_MODIFY_REGEX);
  if (cronMatch) {
    const isRemove = /-r/i.test(cronMatch[0]);
    return {
      isPersistenceModification: true,
      mechanism: 'crontab',
      action: isRemove ? 'delete' : 'edit',
      reason: `Unauthorized crontab ${isRemove ? 'removal' : 'modification/installation'} command intercepted`,
      detectedPattern: cronMatch[0].trim(),
    };
  }

  if (CRONTAB_STDIN_PIPE_REGEX.test(rawCommand)) {
    return {
      isPersistenceModification: true,
      mechanism: 'crontab',
      action: 'overwrite',
      reason: 'Piped stream directly overwriting user crontab persistence intercepted',
      detectedPattern: rawCommand.trim(),
    };
  }

  // 2. Direct filesystem write to cron spool / directories
  const spoolMatch = rawCommand.match(CRON_DIR_WRITE_REGEX);
  if (spoolMatch) {
    const targetPath = spoolMatch[1];
    return {
      isPersistenceModification: true,
      mechanism: 'cron_spool',
      action: 'overwrite',
      target: targetPath,
      reason: `Direct write tampering to cron spool or configuration directory "${targetPath}"`,
      detectedPattern: spoolMatch[0].trim(),
    };
  }

  // 3. Windows schtasks /create, /delete, /change
  const schtasksMatch = rawCommand.match(SCHTASKS_MODIFY_REGEX);
  if (schtasksMatch) {
    const isDelete = /\/delete|-delete/i.test(schtasksMatch[0]);
    return {
      isPersistenceModification: true,
      mechanism: 'schtasks',
      action: isDelete ? 'delete' : 'create',
      reason: `Windows Task Scheduler task ${isDelete ? 'deletion' : 'creation/modification'} intercepted via schtasks.exe`,
      detectedPattern: schtasksMatch[0].trim(),
    };
  }

  // 4. PowerShell ScheduledTask cmdlets
  const psMatch = rawCommand.match(PS_SCHEDULED_TASK_REGEX);
  if (psMatch) {
    const cmdlet = psMatch[1];
    const isUnregister = cmdlet.toLowerCase().includes('unregister');
    return {
      isPersistenceModification: true,
      mechanism: 'schtasks',
      action: isUnregister ? 'delete' : 'create',
      reason: `PowerShell scheduled task cmdlet intercepted: [${cmdlet}]`,
      detectedPattern: psMatch[0].trim(),
    };
  }

  // 5. Systemd timer enable / write
  const timerMatch = rawCommand.match(SYSTEMD_TIMER_ENABLE_REGEX);
  if (timerMatch) {
    return {
      isPersistenceModification: true,
      mechanism: 'systemd_timer',
      action: 'create',
      reason: 'Unauthorized activation of systemd timer persistence intercepted',
      detectedPattern: timerMatch[0].trim(),
    };
  }

  const timerWriteMatch = rawCommand.match(SYSTEMD_TIMER_WRITE_REGEX);
  if (timerWriteMatch) {
    const targetFile = timerWriteMatch[1];
    return {
      isPersistenceModification: true,
      mechanism: 'systemd_timer',
      action: 'create',
      target: targetFile,
      reason: `Systemd timer configuration file creation intercepted: "${targetFile}"`,
      detectedPattern: timerWriteMatch[0].trim(),
    };
  }

  // 6. at / batch command scheduling
  const atMatch = rawCommand.match(AT_SCHEDULE_REGEX);
  if (atMatch) {
    return {
      isPersistenceModification: true,
      mechanism: 'at',
      action: 'create',
      reason: 'Delayed execution scheduled persistence via at/batch intercepted',
      detectedPattern: atMatch[0].trim(),
    };
  }

  return { isPersistenceModification: false };
}

/**
 * Creates the standard SentinelRule to block unauthorized scheduled persistence modifications.
 */
export function createCronPersistenceRule(): SentinelRule {
  return {
    id: 'block-cron-persistence',
    name: 'Block Crontab & Scheduled Task Manipulation',
    category: 'shell',
    priority: 915,
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
        const detection = detectCronPersistence(cmd);
        if (detection.isPersistenceModification) {
          return {
            ruleId: 'block-cron-persistence',
            ruleName: 'Block Crontab & Scheduled Task Manipulation',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: detection.reason || 'Unauthorized scheduled task or cron persistence modification detected',
            detectedPattern: detection.detectedPattern,
          };
        }
      }

      return null;
    },
  };
}

export const cronPersistenceBlockerRule: SentinelRule = createCronPersistenceRule();
