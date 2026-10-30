/**
 * Windows PowerShell Security Policy Bypass Flag Detector.
 * Identifies and intercepts command invocations that attempt to bypass
 * PowerShell ExecutionPolicy, suppress user interactive prompts, stealthily
 * hide console windows, or launch obfuscated base64 encoded scripts
 * (-ExecutionPolicy Bypass, -WindowStyle Hidden, -NoProfile, -NonInteractive, -EncodedCommand, -enc, -e).
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export interface PowerShellBypassResult {
  isBypass: boolean;
  flagsDetected: string[];
  reason?: string;
  detectedPattern?: string;
}

// Check if invocation starts with powershell / pwsh executable
const POWERSHELL_BINARY_REGEX = /(?:^|[;&|]\s*)(?:powershell(?:\.exe)?|pwsh(?:\.exe)?)\b/i;

// Regex patterns for suspicious bypass flags
const EP_BYPASS_REGEX = /(?:-ExecutionPolicy|-ep|-exec)\s+(?:Bypass|Unrestricted|RemoteSigned)/i;
const SET_EP_BYPASS_REGEX = /Set-ExecutionPolicy\s+.*?(?:Bypass|Unrestricted)/i;
const WINDOW_HIDDEN_REGEX = /(?:-WindowStyle|-w)\s+(?:Hidden|1)/i;
const NO_PROFILE_REGEX = /(?:-NoProfile|-nop)\b/i;
const NON_INTERACTIVE_REGEX = /(?:-NonInteractive|-noni)\b/i;
const ENCODED_COMMAND_REGEX = /(?:-EncodedCommand|-encoded|-enc|-e)\s+[A-Za-z0-9+/=]{4,}/i;

/**
 * Analyzes command line strings for PowerShell bypass and stealth execution flags.
 */
export function detectPowerShellBypass(rawCommand: string): PowerShellBypassResult {
  if (!rawCommand || typeof rawCommand !== 'string') {
    return { isBypass: false, flagsDetected: [] };
  }

  const flagsDetected: string[] = [];

  // Check Set-ExecutionPolicy Bypass
  const setEpMatch = rawCommand.match(SET_EP_BYPASS_REGEX);
  if (setEpMatch) {
    flagsDetected.push('Set-ExecutionPolicy Bypass');
    return {
      isBypass: true,
      flagsDetected,
      reason: 'Script execution policy override intercepted via Set-ExecutionPolicy Bypass/Unrestricted',
      detectedPattern: setEpMatch[0].trim(),
    };
  }

  // Check if powershell or pwsh is invoked
  const isPsInvocation = POWERSHELL_BINARY_REGEX.test(rawCommand);
  if (isPsInvocation) {
    if (EP_BYPASS_REGEX.test(rawCommand)) {
      flagsDetected.push('-ExecutionPolicy Bypass');
    }
    if (WINDOW_HIDDEN_REGEX.test(rawCommand)) {
      flagsDetected.push('-WindowStyle Hidden');
    }
    if (ENCODED_COMMAND_REGEX.test(rawCommand)) {
      flagsDetected.push('-EncodedCommand');
    }
    if (NO_PROFILE_REGEX.test(rawCommand)) {
      flagsDetected.push('-NoProfile');
    }
    if (NON_INTERACTIVE_REGEX.test(rawCommand)) {
      flagsDetected.push('-NonInteractive');
    }

    // Trigger violation if critical bypass flag is used
    if (
      flagsDetected.includes('-ExecutionPolicy Bypass') ||
      flagsDetected.includes('-WindowStyle Hidden') ||
      flagsDetected.includes('-EncodedCommand')
    ) {
      return {
        isBypass: true,
        flagsDetected,
        reason: `PowerShell security bypass flags detected: [${flagsDetected.join(', ')}]`,
        detectedPattern: rawCommand.trim(),
      };
    }

    if (flagsDetected.length >= 2) {
      return {
        isBypass: true,
        flagsDetected,
        reason: `PowerShell automated stealth evasion flags detected: [${flagsDetected.join(', ')}]`,
        detectedPattern: rawCommand.trim(),
      };
    }
  }

  return { isBypass: false, flagsDetected: [] };
}

/**
 * Creates the standard SentinelRule to strictly block PowerShell bypass flags.
 */
export function createPowerShellBypassRule(): SentinelRule {
  return {
    id: 'block-powershell-bypass',
    name: 'Block PowerShell Security Policy Bypass & Stealth Flags',
    category: 'shell',
    priority: 918,
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
        const detection = detectPowerShellBypass(cmd);
        if (detection.isBypass) {
          return {
            ruleId: 'block-powershell-bypass',
            ruleName: 'Block PowerShell Security Policy Bypass & Stealth Flags',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: detection.reason || 'Unauthorized PowerShell execution policy bypass attempt intercepted',
            detectedPattern: detection.detectedPattern,
          };
        }
      }

      return null;
    },
  };
}

export const powerShellBypassBlockerRule: SentinelRule = createPowerShellBypassRule();
