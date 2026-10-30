/**
 * Fork Bomb & Resource Exhaustion Signature Detector.
 * Prevents system freezing via exponential process tree fork bombs and infinite background subshell spawning.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';
import { parseShellCommand } from './tokenizer.js';

export interface ForkBombDetectionResult {
  isForkBomb: boolean;
  reason?: string;
  detectedPattern?: string;
}

// Regex patterns for shell fork bomb signatures
const BASH_CLASSIC_FORKBOMB_REGEX = /:\s*\(\s*\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:/;
const GENERIC_RECURSIVE_FORKBOMB_REGEX = /([a-zA-Z0-9_\$]+)\s*\(\s*\)\s*\{[^}]*\b\1\s*\|\s*\1\s*&[^}]*\}\s*;\s*\1/;
const WINDOWS_BATCH_FORKBOMB_REGEX = /%0\s*\|\s*%0/i;
const PERL_FORKBOMB_REGEX = /perl\s+.*?(fork\s*while\s*fork|while\s*\(\s*1\s*\)\s*\{\s*fork)/i;
const PYTHON_FORKBOMB_REGEX = /python[23]?\s+.*?(while\s+1\s*:\s*os\.fork|os\.fork\s*\(\s*\)\s+for\s+.*?in\s+range)/i;
const INFINITE_BG_SPAWN_REGEX = /while\s+(:|true|1)\s*;\s*do\s+([a-zA-Z0-9_\/.-]+|\$\([^)]+\))\s*&\s*done/i;

/**
 * Normalizes shell script to detect obfuscated variable aliasing and nested evals.
 */
function normalizeScript(raw: string): string {
  let normalized = raw.trim();

  // Strip common evaluation wrappers (eval, sh -c, bash -c)
  normalized = normalized.replace(/^(?:sudo|doas|nohup|eval)\s+/i, '');
  const subshellMatch = normalized.match(/^(?:bash|sh|zsh)\s+-c\s+["'](.*)["']$/i);
  if (subshellMatch) {
    normalized = subshellMatch[1];
  }

  // Resolve simple variable aliasing like: f=':'; $f(){ $f|$f& };$f
  const varAssignments = new Map<string, string>();
  const assignRegex = /(?:^|\s)([a-zA-Z_][a-zA-Z0-9_]*)=["']?([^"'\s;]+)["']?/g;
  let match: RegExpExecArray | null;
  while ((match = assignRegex.exec(normalized)) !== null) {
    varAssignments.set(match[1], match[2]);
  }

  for (const [varName, val] of varAssignments.entries()) {
    const varPattern = new RegExp(`\\$${varName}|\\$\\{${varName}\\}`, 'g');
    normalized = normalized.replace(varPattern, val);
  }

  return normalized;
}

/**
 * Analyzes a command line string for process exhaustion and fork bomb patterns.
 */
export function detectForkBomb(rawCommand: string): ForkBombDetectionResult {
  if (!rawCommand || typeof rawCommand !== 'string') {
    return { isForkBomb: false };
  }

  const normalized = normalizeScript(rawCommand);

  // 1. Classic Bash Fork Bomb: :(){ :|:& };:
  if (BASH_CLASSIC_FORKBOMB_REGEX.test(normalized)) {
    return {
      isForkBomb: true,
      reason: 'Classic Bash recursive fork bomb pattern detected (:(){ :|:& };:)',
      detectedPattern: ':(){ :|:& };:',
    };
  }

  // 2. Generic named recursive fork bomb (e.g. bomb(){ bomb|bomb& };bomb or f(){ f|f& };f)
  const genericMatch = normalized.match(GENERIC_RECURSIVE_FORKBOMB_REGEX);
  if (genericMatch) {
    return {
      isForkBomb: true,
      reason: `Recursive self-piping background fork bomb detected in function '${genericMatch[1]}'`,
      detectedPattern: genericMatch[0],
    };
  }

  // 3. Windows Batch Fork Bomb: %0|%0
  if (WINDOWS_BATCH_FORKBOMB_REGEX.test(normalized)) {
    return {
      isForkBomb: true,
      reason: 'Windows Batch infinite process recursion pattern detected (%0|%0)',
      detectedPattern: '%0|%0',
    };
  }

  // 4. Perl fork bomb invocation
  const perlMatch = normalized.match(PERL_FORKBOMB_REGEX);
  if (perlMatch) {
    return {
      isForkBomb: true,
      reason: 'Perl infinite fork execution loop detected',
      detectedPattern: perlMatch[1],
    };
  }

  // 5. Python fork bomb
  const pythonMatch = normalized.match(PYTHON_FORKBOMB_REGEX);
  if (pythonMatch) {
    return {
      isForkBomb: true,
      reason: 'Python recursive os.fork() exhaustion loop detected',
      detectedPattern: pythonMatch[1],
    };
  }

  // 6. Infinite background subshell spawner: while true; do ... & done
  const infiniteBgMatch = normalized.match(INFINITE_BG_SPAWN_REGEX);
  if (infiniteBgMatch) {
    return {
      isForkBomb: true,
      reason: 'Infinite background process spawning loop detected without rate limits',
      detectedPattern: infiniteBgMatch[0],
    };
  }

  return { isForkBomb: false };
}

/**
 * Creates the standard SentinelRule to strictly block fork bombs and denial-of-service process exhaustion.
 */
export function createForkBombRule(): SentinelRule {
  return {
    id: 'block-fork-bomb',
    name: 'Block Fork Bombs & Denial-of-Service Process Spawns',
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
        const detection = detectForkBomb(cmd);
        if (detection.isForkBomb) {
          return {
            ruleId: 'block-fork-bomb',
            ruleName: 'Block Fork Bombs & Denial-of-Service Process Spawns',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: detection.reason || 'Malicious fork bomb / process exhaustion pattern detected',
            detectedPattern: detection.detectedPattern,
          };
        }
      }

      return null;
    },
  };
}

export const forkBombBlockerRule: SentinelRule = createForkBombRule();
