/**
 * Shell Environment Variable Leak Prevention Guard.
 * Identifies and intercepts attempts to dump, exfiltrate, or harvest the full
 * operating system environment table (which frequently harbors sensitive API keys,
 * database credentials, access tokens, and private SSH secrets).
 *
 * Catches:
 * - Bare `env` / `printenv`
 * - Bare `export` / `export -p`
 * - Bare `set`
 * - `declare -p` / `declare -x`
 * - Reading `/proc/self/environ` or `/proc/<pid>/environ`
 * - Windows `dir env:` or `Get-ChildItem env:` or `[System.Environment]::GetEnvironmentVariables()`
 *
 * Allows:
 * - Targeted whitelisted variables: `printenv PATH`, `printenv NODE_ENV`, `echo $PATH`
 * - Variable assignments: `export NODE_ENV=production`
 * - Scoped commands: `env -i cmd`, `env PATH=$PATH npm test`
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export type EnvLeakMechanism =
  | 'env'
  | 'printenv'
  | 'export_dump'
  | 'set_dump'
  | 'proc_environ'
  | 'powershell_env';

export interface EnvLeakDetectionResult {
  isEnvDump: boolean;
  mechanism?: EnvLeakMechanism;
  targetVariable?: string;
  reason?: string;
  detectedPattern?: string;
}

export interface EnvLeakRuleOptions {
  allowedVariables?: string[];
}

export const DEFAULT_ALLOWED_ENV_VARS = [
  'PATH',
  'NODE_ENV',
  'HOME',
  'USER',
  'USERNAME',
  'SHELL',
  'PWD',
  'LANG',
  'LC_ALL',
  'TERM',
  'EDITOR',
  'TMP',
  'TEMP',
  'HOSTNAME',
  'HOST',
  'CI',
];

// 1. printenv (bare or with argument)
const PRINTENV_REGEX = /(?:^|[;&|]\s*)(?:sudo\s+)?printenv(?:\s+([a-zA-Z0-9_]+))?(?:\s*|\s*\|\s*.*|\s*>\s*.*|\s*2>&1)(?=[;&|]|$)/i;

// 2. export -p or bare export (without '=')
const BARE_EXPORT_REGEX = /(?:^|[;&|]\s*)(?:sudo\s+)?export(?:\s+-p)?(?:\s*|\s*\|\s*.*|\s*>\s*.*|\s*2>&1)(?=[;&|]|$)/i;

// 3. bare set command (excluding set -e, set -x, set var=val)
const BARE_SET_REGEX = /(?:^|[;&|]\s*)set(?:\s*|\s*\|\s*.*|\s*>\s*.*)(?=[;&|]|$)/i;

// 4. declare -p or declare -x
const DECLARE_DUMP_REGEX = /(?:^|[;&|]\s*)(?:sudo\s+)?declare\s+-[px](?:\s*|\s*\|\s*.*|\s*>\s*.*)(?=[;&|]|$)/i;

// 5. /proc/*/environ access
const PROC_ENVIRON_REGEX = /(?:cat|less|more|tail|head|strings|xxd|hexdump|od|awk|sed|grep|python|perl|node)\s+.*?(?:\/proc\/(?:self|[0-9]+)\/environ)/i;

// 6. Windows / PowerShell env drive dump
const PS_ENV_DUMP_REGEX = /(?:Get-ChildItem|gci|dir|ls)\s+.*?(?:env:|Env:\\)|\[(?:System\.)?Environment\]::GetEnvironmentVariables\s*\(\s*\)/i;

/**
 * Analyzes command line strings for environment variable dump / leakage vectors.
 */
export function detectEnvLeak(
  rawCommand: string,
  allowedVariables: string[] = DEFAULT_ALLOWED_ENV_VARS
): EnvLeakDetectionResult {
  if (!rawCommand || typeof rawCommand !== 'string') {
    return { isEnvDump: false };
  }

  // 1. /proc/*/environ
  const procMatch = rawCommand.match(PROC_ENVIRON_REGEX);
  if (procMatch) {
    return {
      isEnvDump: true,
      mechanism: 'proc_environ',
      reason: 'Direct access to Linux kernel process environment memory (/proc/*/environ) intercepted',
      detectedPattern: procMatch[0].trim(),
    };
  }

  // 2. PowerShell / Windows Env: drive dump
  const psMatch = rawCommand.match(PS_ENV_DUMP_REGEX);
  if (psMatch) {
    return {
      isEnvDump: true,
      mechanism: 'powershell_env',
      reason: 'PowerShell full environment variable directory enumeration intercepted via Env: drive',
      detectedPattern: psMatch[0].trim(),
    };
  }

  // 3. printenv
  const printenvMatch = rawCommand.match(PRINTENV_REGEX);
  if (printenvMatch) {
    const targetVar = printenvMatch[1];
    // If target variable specified and in allowed list, permit
    if (targetVar) {
      if (allowedVariables.map(v => v.toUpperCase()).includes(targetVar.toUpperCase())) {
        return { isEnvDump: false };
      }
      return {
        isEnvDump: true,
        mechanism: 'printenv',
        targetVariable: targetVar,
        reason: `Targeted inspection of non-whitelisted environment variable [${targetVar}] intercepted`,
        detectedPattern: printenvMatch[0].trim(),
      };
    }

    // Bare printenv dumps everything
    return {
      isEnvDump: true,
      mechanism: 'printenv',
      reason: 'Full environment variable table dump intercepted via bare printenv',
      detectedPattern: printenvMatch[0].trim(),
    };
  }

  // 4. env command inspection
  const envMatch = rawCommand.match(/(?:^|[;&|]\s*)(?:sudo\s+)?env\b/i);
  if (envMatch) {
    const afterEnvRaw = rawCommand.slice(envMatch.index! + envMatch[0].length);
    const sanitized = afterEnvRaw.replace(/2>&1/g, ' ');
    const segment = sanitized.split(/[;&|]/)[0].trim();
    const cleanSegment = segment.replace(/>>?\s*\S+|<+\s*\S+/g, '').trim();

    if (!cleanSegment || cleanSegment === '-0') {
      return {
        isEnvDump: true,
        mechanism: 'env',
        reason: 'Full environment variable table dump intercepted via bare env',
        detectedPattern: rawCommand.trim(),
      };
    }

    const tokens = cleanSegment.split(/\s+/).filter(Boolean);
    const hasSubcommand = tokens.some(t => !t.includes('=') && !t.startsWith('-'));
    if (!hasSubcommand) {
      return {
        isEnvDump: true,
        mechanism: 'env',
        reason: 'Full environment variable table dump intercepted via bare env',
        detectedPattern: rawCommand.trim(),
      };
    }
  }

  // 5. bare export / export -p (make sure it does NOT contain '=')
  const exportMatch = rawCommand.match(BARE_EXPORT_REGEX);
  if (exportMatch) {
    const afterExport = rawCommand.slice(rawCommand.indexOf(exportMatch[0]) + exportMatch[0].length).trim();
    if (!afterExport.includes('=')) {
      return {
        isEnvDump: true,
        mechanism: 'export_dump',
        reason: 'Environment variable enumeration intercepted via bare export / export -p',
        detectedPattern: exportMatch[0].trim(),
      };
    }
  }

  // 6. declare -p or declare -x
  const declareMatch = rawCommand.match(DECLARE_DUMP_REGEX);
  if (declareMatch) {
    return {
      isEnvDump: true,
      mechanism: 'export_dump',
      reason: 'Full shell variable definition dump intercepted via declare -p/-x',
      detectedPattern: declareMatch[0].trim(),
    };
  }

  // 7. bare set command (excluding shell options like set -e, set +x, or variable assignment set a=b)
  const setMatch = rawCommand.match(BARE_SET_REGEX);
  if (setMatch) {
    const trimmed = rawCommand.trim();
    const isOptionFlag = /^set\s+[+-][a-zA-Z0-9]+(?:\s+[+-][a-zA-Z0-9]+)*$/i.test(trimmed);
    const isVariableAssign = /^set\s+[a-zA-Z0-9_]+=.*$/i.test(trimmed);
    if (!isOptionFlag && !isVariableAssign) {
      return {
        isEnvDump: true,
        mechanism: 'set_dump',
        reason: 'Environment and shell variable table dump intercepted via bare set',
        detectedPattern: setMatch[0].trim(),
      };
    }
  }

  return { isEnvDump: false };
}

/**
 * Creates the standard SentinelRule to strictly block shell environment table dumping.
 */
export function createEnvLeakPreventionRule(options?: EnvLeakRuleOptions): SentinelRule {
  const allowedVars = options?.allowedVariables || DEFAULT_ALLOWED_ENV_VARS;

  return {
    id: 'block-env-leak',
    name: 'Block Environment Variable Leak & Full Table Dumps',
    category: 'shell',
    priority: 900,
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
        const detection = detectEnvLeak(cmd, allowedVars);
        if (detection.isEnvDump) {
          return {
            ruleId: 'block-env-leak',
            ruleName: 'Block Environment Variable Leak & Full Table Dumps',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: detection.reason || 'Attempt to dump or exfiltrate environment variables intercepted',
            detectedPattern: detection.detectedPattern,
          };
        }
      }

      return null;
    },
  };
}

export const envLeakBlockerRule: SentinelRule = createEnvLeakPreventionRule();
