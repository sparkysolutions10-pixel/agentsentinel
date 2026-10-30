/**
 * Base64-Encoded Shell Command Execution Detector.
 * Identifies and intercepts obfuscated command execution where base64 payloads
 * are piped into shells, evaluated, or launched via -EncodedCommand.
 * Automatically decodes and re-evaluates the payload against shell security rules.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export interface Base64ExecDetectionResult {
  isBase64Exec: boolean;
  reason?: string;
  detectedPattern?: string;
  rawPayload?: string;
  decodedCommand?: string;
}

export interface Base64RuleOptions {
  nestedRules?: SentinelRule[];
}

// Regex patterns for base64 decode-and-execute pipelines
const BASH_BASE64_PIPE_REGEX = /(?:echo|printf)\s+(?:-[a-zA-Z]+\s+)?["']?([A-Za-z0-9+/=\s]{4,})["']?\s*\|\s*base64\s+(?:-[a-zA-Z]*d[a-zA-Z]*|--decode)\s*\|\s*(?:\/bin\/)?(?:ba|z)?sh(?:\s+-[a-zA-Z]+)?/i;
const BASH_BASE64_HEREDOC_PIPE_REGEX = /base64\s+(?:-[a-zA-Z]*d[a-zA-Z]*|--decode)\s*<<<\s*["']?([A-Za-z0-9+/=\s]{4,})["']?\s*\|\s*(?:\/bin\/)?(?:ba|z)?sh(?:\s+-[a-zA-Z]+)?/i;
const OPENSSL_BASE64_PIPE_REGEX = /(?:echo|printf)\s+(?:-[a-zA-Z]+\s+)?["']?([A-Za-z0-9+/=\s]{4,})["']?\s*\|\s*openssl\s+(?:enc\s+)?-(?:base64\s+-d|d\s+-base64)\s*\|\s*(?:\/bin\/)?(?:ba|z)?sh(?:\s+-[a-zA-Z]+)?/i;
const POWERSHELL_ENC_REGEX = /powershell(?:\.exe)?\s+.*?(?:-enc|-EncodedCommand|-e)\s+["']?([A-Za-z0-9+/=\s]{4,})["']?/i;
const PYTHON_BASE64_EXEC_REGEX = /python[23]?\s+.*?(?:exec\s*\(\s*base64\.(?:b64decode|decodebytes)\s*\(\s*['"]([A-Za-z0-9+/=\s]{4,})['"]\s*\)\s*\))/is;
const NODE_BASE64_EVAL_REGEX = /node(?:js)?\s+.*?(?:eval\s*\(\s*Buffer\.from\s*\(\s*['"]([A-Za-z0-9+/=\s]{4,})['"]\s*,\s*['"]base64['"]\s*\)\.toString\s*\(\s*\)\s*\))/is;

/**
 * Safely decodes standard base64 or UTF-16LE (PowerShell) strings.
 */
export function safelyDecodeBase64(b64: string, isPowerShell: boolean = false): string | null {
  try {
    const cleanB64 = b64.trim().replace(/\s+/g, '');
    const buffer = Buffer.from(cleanB64, 'base64');
    if (isPowerShell) {
      // PowerShell -EncodedCommand encodes UTF-16LE bytes
      return buffer.toString('utf16le');
    }
    return buffer.toString('utf-8');
  } catch {
    return null;
  }
}

/**
 * Analyzes command line strings for base64 decode-and-execute attack vectors.
 */
export function detectBase64Exec(rawCommand: string): Base64ExecDetectionResult {
  if (!rawCommand || typeof rawCommand !== 'string') {
    return { isBase64Exec: false };
  }

  // 1. Classic Bash echo <b64> | base64 -d | sh
  const bashMatch = rawCommand.match(BASH_BASE64_PIPE_REGEX);
  if (bashMatch) {
    const rawPayload = bashMatch[1].trim();
    const decoded = safelyDecodeBase64(rawPayload) || '';
    return {
      isBase64Exec: true,
      reason: `Obfuscated base64 payload piped directly into shell execution (decoded: "${decoded.slice(0, 80)}")`,
      detectedPattern: bashMatch[0],
      rawPayload,
      decodedCommand: decoded,
    };
  }

  // 2. Heredoc / here-string base64 -d <<< <b64> | bash
  const hereMatch = rawCommand.match(BASH_BASE64_HEREDOC_PIPE_REGEX);
  if (hereMatch) {
    const rawPayload = hereMatch[1].trim();
    const decoded = safelyDecodeBase64(rawPayload) || '';
    return {
      isBase64Exec: true,
      reason: `Base64 here-string payload piped directly into shell (decoded: "${decoded.slice(0, 80)}")`,
      detectedPattern: hereMatch[0],
      rawPayload,
      decodedCommand: decoded,
    };
  }

  // 3. OpenSSL base64 decode to shell
  const opensslMatch = rawCommand.match(OPENSSL_BASE64_PIPE_REGEX);
  if (opensslMatch) {
    const rawPayload = opensslMatch[1].trim();
    const decoded = safelyDecodeBase64(rawPayload) || '';
    return {
      isBase64Exec: true,
      reason: `OpenSSL base64-decoded payload piped directly into shell (decoded: "${decoded.slice(0, 80)}")`,
      detectedPattern: opensslMatch[0],
      rawPayload,
      decodedCommand: decoded,
    };
  }

  // 4. PowerShell -EncodedCommand
  const psMatch = rawCommand.match(POWERSHELL_ENC_REGEX);
  if (psMatch) {
    const rawPayload = psMatch[1].trim();
    const decoded = safelyDecodeBase64(rawPayload, true) || safelyDecodeBase64(rawPayload, false) || '';
    return {
      isBase64Exec: true,
      reason: `PowerShell encoded command execution payload (decoded: "${decoded.slice(0, 80)}")`,
      detectedPattern: psMatch[0],
      rawPayload,
      decodedCommand: decoded,
    };
  }

  // 5. Python exec(base64.b64decode(...))
  const pyMatch = rawCommand.match(PYTHON_BASE64_EXEC_REGEX);
  if (pyMatch) {
    const rawPayload = pyMatch[1].trim();
    const decoded = safelyDecodeBase64(rawPayload) || '';
    return {
      isBase64Exec: true,
      reason: `Python dynamic base64 execution payload (decoded: "${decoded.slice(0, 80)}")`,
      detectedPattern: pyMatch[0].slice(0, 80),
      rawPayload,
      decodedCommand: decoded,
    };
  }

  // 6. Node eval(Buffer.from(..., 'base64').toString())
  const nodeMatch = rawCommand.match(NODE_BASE64_EVAL_REGEX);
  if (nodeMatch) {
    const rawPayload = nodeMatch[1].trim();
    const decoded = safelyDecodeBase64(rawPayload) || '';
    return {
      isBase64Exec: true,
      reason: `Node.js dynamic base64 eval payload (decoded: "${decoded.slice(0, 80)}")`,
      detectedPattern: nodeMatch[0].slice(0, 80),
      rawPayload,
      decodedCommand: decoded,
    };
  }

  return { isBase64Exec: false };
}

/**
 * Automatically decodes base64 payload and evaluates the underlying command
 * against a list of SentinelRules.
 */
export async function decodeAndEvaluatePayload(
  rawCommand: string,
  rules: SentinelRule[] = []
): Promise<{
  detection: Base64ExecDetectionResult;
  innerViolation: RuleViolation | null;
}> {
  const detection = detectBase64Exec(rawCommand);
  if (!detection.isBase64Exec || !detection.decodedCommand) {
    return { detection, innerViolation: null };
  }

  const innerContext: ToolCallContext = {
    id: 'b64-decoded-eval',
    toolName: 'bash',
    category: 'shell',
    params: {
      command: detection.decodedCommand,
      cmd: detection.decodedCommand,
    },
    timestamp: Date.now(),
  };

  for (const rule of rules) {
    if (!rule || !rule.enabled) continue;
    const violation = await rule.evaluate(innerContext);
    if (violation) {
      return { detection, innerViolation: violation };
    }
  }

  return { detection, innerViolation: null };
}

/**
 * Creates the standard SentinelRule to strictly block base64-encoded shell execution vectors,
 * with optional re-evaluation of decoded inner payloads against nested rules.
 */
export function createBase64ExecRule(options?: Base64RuleOptions): SentinelRule {
  const hasNestedRules = !!(options?.nestedRules && options.nestedRules.length > 0);

  return {
    id: 'block-base64-exec',
    name: 'Block Base64-Encoded Shell Execution Vectors',
    category: 'shell',
    priority: 930,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null | Promise<RuleViolation | null> => {
      const candidateCommands: string[] = [];
      if (typeof ctx.params?.cmd === 'string') candidateCommands.push(ctx.params.cmd);
      if (typeof ctx.params?.command === 'string') candidateCommands.push(ctx.params.command);
      if (typeof ctx.params?.commandLine === 'string') candidateCommands.push(ctx.params.commandLine);
      if (typeof ctx.params?.CommandLine === 'string') candidateCommands.push(ctx.params.CommandLine);
      if (typeof ctx.params?.script === 'string') candidateCommands.push(ctx.params.script);
      if (typeof ctx.params?.input === 'string') candidateCommands.push(ctx.params.input);

      for (const cmd of candidateCommands) {
        const detection = detectBase64Exec(cmd);
        if (detection.isBase64Exec) {
          if (hasNestedRules && detection.decodedCommand) {
            return (async () => {
              let severity: 'high' | 'critical' = 'high';
              let reason = detection.reason || 'Obfuscated base64 shell command execution detected';

              const innerContext: ToolCallContext = {
                id: `${ctx.id}-b64-decoded`,
                agentId: ctx.agentId,
                toolName: ctx.toolName,
                category: 'shell',
                params: { command: detection.decodedCommand, cmd: detection.decodedCommand },
                timestamp: ctx.timestamp,
              };

              for (const nestedRule of options!.nestedRules!) {
                if (!nestedRule || !nestedRule.enabled) continue;
                const innerViolation = await nestedRule.evaluate(innerContext);
                if (innerViolation) {
                  severity = 'critical';
                  const safeDecoded = detection.decodedCommand || '';
                  reason = `Obfuscated base64 payload executing dangerous command [${innerViolation.ruleId}]: ${innerViolation.reason} (decoded: "${safeDecoded.slice(0, 80)}")`;
                  break;
                }
              }

              return {
                ruleId: 'block-base64-exec',
                ruleName: 'Block Base64-Encoded Shell Execution Vectors',
                severity,
                verdict: Verdict.BLOCK,
                reason,
                detectedPattern: detection.detectedPattern,
              };
            })();
          }

          return {
            ruleId: 'block-base64-exec',
            ruleName: 'Block Base64-Encoded Shell Execution Vectors',
            severity: 'high',
            verdict: Verdict.BLOCK,
            reason: detection.reason || 'Obfuscated base64 shell command execution detected',
            detectedPattern: detection.detectedPattern,
          };
        }
      }

      return null;
    },
  };
}

export const base64ExecBlockerRule: SentinelRule = createBase64ExecRule();
