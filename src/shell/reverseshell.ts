/**
 * Reverse Shell & Remote Access Payload Detector.
 * Identifies and intercepts outbound interactive command-and-control (C2) shell connections,
 * including bash /dev/tcp, netcat -e, python/perl socket spawns, socat, and PowerShell TCP shells.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export interface ReverseShellDetectionResult {
  isReverseShell: boolean;
  reason?: string;
  detectedPattern?: string;
  targetHost?: string;
  targetPort?: number;
}

// Regex patterns for reverse shell signatures
const BASH_DEV_TCP_REGEX = /(?:bash|sh|zsh)?\s*(?:-i)?\s*(?:>&|>\s*&\s*)\s*\/dev\/(?:tcp|udp)\/([a-zA-Z0-9_.-]+)\/([0-9]+)/i;
const BASH_DEV_TCP_PIPE_REGEX = /exec\s+[0-9]*\s*<>\s*\/dev\/(?:tcp|udp)\/([a-zA-Z0-9_.-]+)\/([0-9]+)/i;
const NETCAT_EXEC_SHELL_REGEX = /(?:^|\s)(?:nc|ncat|netcat)\s+.*?(?:-e|-c)\s+(?:\/bin\/(?:ba)?sh|cmd(?:\.exe)?|powershell(?:\.exe)?)/i;
const NETCAT_FIFO_REVERSE_REGEX = /mkfifo\s+[^\s;]+.*?\|\s*(?:\/bin\/)?(?:ba)?sh\s+.*?(?:nc|ncat|netcat)\s+([a-zA-Z0-9_.-]+)\s+([0-9]+)/i;
const PYTHON_SOCKET_REVERSE_REGEX = /python[23]?\s+.*?(?:import\s+socket.*?os\.dup2.*?\/bin\/(?:ba)?sh|socket\.socket.*?os\.dup2)/is;
const PERL_SOCKET_REVERSE_REGEX = /perl\s+.*?(?:IO::Socket::INET.*?fdopen|Socket.*?connect.*?open\(STDIN)/is;
const SOCAT_REVERSE_REGEX = /socat\s+.*?(?:tcp-connect|tcp):([a-zA-Z0-9_.-]+):([0-9]+).*?exec:['"]?(?:bash|sh|cmd)/i;
const POWERSHELL_TCP_REVERSE_REGEX = /powershell.*?System\.Net\.Sockets\.TCPClient.*?GetStream.*?(?:Invoke-Expression|iex)/is;
const PHP_SOCKET_REVERSE_REGEX = /php\s+.*?(?:fsockopen|pfsockopen).*?exec\s*\(\s*['"]\/(?:bin\/)?(?:ba)?sh/is;

/**
 * Normalizes shell script to unwrap encoding, sudo, and subshell escapes.
 */
function normalizePayload(raw: string): string {
  let normalized = raw.trim();
  // Strip sudo/doas
  normalized = normalized.replace(/^(?:sudo|doas|nohup)\s+/i, '');
  return normalized;
}

/**
 * Analyzes command line strings for interactive outbound reverse shell payloads.
 */
export function detectReverseShell(rawCommand: string): ReverseShellDetectionResult {
  if (!rawCommand || typeof rawCommand !== 'string') {
    return { isReverseShell: false };
  }

  const normalized = normalizePayload(rawCommand);

  // 1. Bash /dev/tcp or /dev/udp interactive redirection
  const devTcpMatch = normalized.match(BASH_DEV_TCP_REGEX);
  if (devTcpMatch) {
    return {
      isReverseShell: true,
      reason: `Bash interactive /dev/tcp socket redirection to ${devTcpMatch[1]}:${devTcpMatch[2]}`,
      detectedPattern: devTcpMatch[0],
      targetHost: devTcpMatch[1],
      targetPort: parseInt(devTcpMatch[2], 10),
    };
  }

  // 2. Bash file descriptor exec socket redirect
  const devTcpPipeMatch = normalized.match(BASH_DEV_TCP_PIPE_REGEX);
  if (devTcpPipeMatch) {
    return {
      isReverseShell: true,
      reason: `Bash file descriptor socket redirection to /dev/tcp/${devTcpPipeMatch[1]}/${devTcpPipeMatch[2]}`,
      detectedPattern: devTcpPipeMatch[0],
      targetHost: devTcpPipeMatch[1],
      targetPort: parseInt(devTcpPipeMatch[2], 10),
    };
  }

  // 3. Netcat with -e / -c execution flag
  const ncExecMatch = normalized.match(NETCAT_EXEC_SHELL_REGEX);
  if (ncExecMatch) {
    return {
      isReverseShell: true,
      reason: 'Netcat execution-flag reverse shell payload (nc -e / -c shell)',
      detectedPattern: ncExecMatch[0].trim(),
    };
  }

  // 4. Netcat FIFO named-pipe reverse shell
  const ncFifoMatch = normalized.match(NETCAT_FIFO_REVERSE_REGEX);
  if (ncFifoMatch) {
    return {
      isReverseShell: true,
      reason: `Netcat FIFO named pipe reverse shell connecting to ${ncFifoMatch[1]}:${ncFifoMatch[2]}`,
      detectedPattern: ncFifoMatch[0],
      targetHost: ncFifoMatch[1],
      targetPort: parseInt(ncFifoMatch[2], 10),
    };
  }

  // 5. Python socket dup2 reverse shell
  const pythonMatch = normalized.match(PYTHON_SOCKET_REVERSE_REGEX);
  if (pythonMatch) {
    return {
      isReverseShell: true,
      reason: 'Python socket and file descriptor dup2 reverse shell payload',
      detectedPattern: pythonMatch[0].slice(0, 80),
    };
  }

  // 6. Perl socket reverse shell
  const perlMatch = normalized.match(PERL_SOCKET_REVERSE_REGEX);
  if (perlMatch) {
    return {
      isReverseShell: true,
      reason: 'Perl IO::Socket interactive reverse shell payload',
      detectedPattern: perlMatch[0].slice(0, 80),
    };
  }

  // 7. Socat TCP interactive shell
  const socatMatch = normalized.match(SOCAT_REVERSE_REGEX);
  if (socatMatch) {
    return {
      isReverseShell: true,
      reason: `Socat interactive PTY TCP reverse shell to ${socatMatch[1]}:${socatMatch[2]}`,
      detectedPattern: socatMatch[0],
      targetHost: socatMatch[1],
      targetPort: parseInt(socatMatch[2], 10),
    };
  }

  // 8. PowerShell TCPClient interactive reverse shell
  const psMatch = normalized.match(POWERSHELL_TCP_REVERSE_REGEX);
  if (psMatch) {
    return {
      isReverseShell: true,
      reason: 'PowerShell System.Net.Sockets.TCPClient interactive reverse shell payload',
      detectedPattern: psMatch[0].slice(0, 80),
    };
  }

  // 9. PHP socket reverse shell
  const phpMatch = normalized.match(PHP_SOCKET_REVERSE_REGEX);
  if (phpMatch) {
    return {
      isReverseShell: true,
      reason: 'PHP fsockopen interactive shell spawn payload',
      detectedPattern: phpMatch[0].slice(0, 80),
    };
  }

  return { isReverseShell: false };
}

/**
 * Creates the standard SentinelRule to strictly block outbound reverse shell payloads.
 */
export function createReverseShellRule(): SentinelRule {
  return {
    id: 'block-reverse-shell',
    name: 'Block Outbound Interactive Reverse Shells & C2 Callbacks',
    category: 'shell',
    priority: 960,
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
        const detection = detectReverseShell(cmd);
        if (detection.isReverseShell) {
          return {
            ruleId: 'block-reverse-shell',
            ruleName: 'Block Outbound Interactive Reverse Shells & C2 Callbacks',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: detection.reason || 'Outbound interactive reverse shell detected',
            detectedPattern: detection.detectedPattern,
          };
        }
      }

      return null;
    },
  };
}

export const reverseShellBlockerRule: SentinelRule = createReverseShellRule();
