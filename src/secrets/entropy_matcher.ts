/**
 * High-Entropy Secret & Credential Pattern Matcher.
 * Scans tool call parameters and payloads for leaked API keys, tokens,
 * passwords, and high-entropy cryptographic strings.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export interface SecretMatchResult {
  secretType: string;
  matchedText: string;
  redactedText: string;
  entropy: number;
  location?: string;
}

/**
 * Calculates the Shannon Entropy of a string.
 * High randomness strings (keys, hashes, secrets) typically exhibit entropy >= 3.8.
 */
export function calculateShannonEntropy(str: string): number {
  if (!str || str.length === 0) return 0;

  const frequencies = new Map<string, number>();
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    frequencies.set(char, (frequencies.get(char) || 0) + 1);
  }

  let entropy = 0;
  const len = str.length;
  for (const count of frequencies.values()) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }

  return entropy;
}

/**
 * Redacts secret string, preserving first and last 3 characters for diagnosis.
 */
export function redactSecret(secret: string): string {
  if (!secret) return '';
  if (secret.length <= 8) return '********';
  const prefix = secret.slice(0, 3);
  const suffix = secret.slice(-3);
  return `${prefix}***${suffix}`;
}

// Built-in secret patterns
const SECRET_REGEX_PATTERNS: Array<{
  name: string;
  pattern: RegExp;
  minEntropy?: number;
  minLength?: number;
}> = [
  // Generic Bearer Token
  {
    name: 'Bearer Token',
    pattern: /\bBearer\s+([a-zA-Z0-9_\-\.]{24,})\b/gi,
    minEntropy: 3.5,
  },
  // Key-value assignment (api_key="...", password="...", token="...")
  {
    name: 'Secret Assignment',
    pattern: /(?:api[_-]?key|secret[_-]?key|auth[_-]?token|access[_-]?token|password|passwd|private[_-]?key)\s*[:=]\s*['"]([a-zA-Z0-9_\-+=/]{16,})['"]/gi,
    minEntropy: 3.2,
  },
  // High-entropy 32-character or 64-character hex tokens
  {
    name: 'High-Entropy Hex Token',
    pattern: /\b[0-9a-fA-F]{32,64}\b/g,
    minEntropy: 3.4,
    minLength: 32,
  },
  // High-entropy Base64 secret strings
  {
    name: 'High-Entropy Base64 Secret',
    pattern: /\b[A-Za-z0-9+/=]{24,}\b/g,
    minEntropy: 4.2,
    minLength: 24,
  },
];

/**
 * Scans a plain text string for high-entropy secrets and credential signatures.
 */
export function scanStringForSecrets(
  text: string,
  minEntropyThreshold: number = 3.6
): SecretMatchResult[] {
  if (!text || typeof text !== 'string') return [];

  const results: SecretMatchResult[] = [];
  const seenMatches = new Set<string>();

  for (const { name, pattern, minEntropy, minLength } of SECRET_REGEX_PATTERNS) {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      const candidate = match[1] || match[0];
      if (!candidate || seenMatches.has(candidate)) continue;

      if (minLength && candidate.length < minLength) continue;

      const entropy = calculateShannonEntropy(candidate);
      const threshold = minEntropy ?? minEntropyThreshold;

      if (entropy >= threshold) {
        seenMatches.add(candidate);
        results.push({
          secretType: name,
          matchedText: candidate,
          redactedText: redactSecret(candidate),
          entropy: parseFloat(entropy.toFixed(2)),
        });
      }
    }
  }

  return results;
}

/**
 * Recursively scans arbitrary tool call parameters for secrets.
 */
export function scanContextForSecrets(
  ctx: ToolCallContext,
  minEntropyThreshold: number = 3.6
): SecretMatchResult[] {
  if (!ctx.params || typeof ctx.params !== 'object') {
    return [];
  }

  const allMatches: SecretMatchResult[] = [];

  function traverse(obj: unknown, currentPath: string): void {
    if (obj === null || obj === undefined) return;

    if (typeof obj === 'string') {
      const matches = scanStringForSecrets(obj, minEntropyThreshold);
      for (const m of matches) {
        m.location = currentPath;
        allMatches.push(m);
      }
      return;
    }

    if (Array.isArray(obj)) {
      obj.forEach((item, index) => traverse(item, `${currentPath}[${index}]`));
      return;
    }

    if (typeof obj === 'object') {
      for (const [key, val] of Object.entries(obj)) {
        const nextPath = currentPath ? `${currentPath}.${key}` : key;
        traverse(val, nextPath);
      }
    }
  }

  traverse(ctx.params, '');
  return allMatches;
}

export interface HighEntropySecretGuardOptions {
  minEntropyThreshold?: number;
  ignoreFields?: string[];
}

/**
 * Creates SentinelRule to guard against credential leakage in tool parameters.
 */
export function createHighEntropySecretGuardRule(
  options?: HighEntropySecretGuardOptions
): SentinelRule {
  const minEntropy = options?.minEntropyThreshold ?? 3.6;

  return {
    id: 'secrets-detect-high-entropy',
    name: 'Block Leaked High-Entropy Secrets and Credentials',
    category: 'secrets',
    priority: 980,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const matches = scanContextForSecrets(ctx, minEntropy);

      if (matches.length > 0) {
        const first = matches[0];
        const countDesc = matches.length > 1 ? ` (${matches.length} secrets detected)` : '';

        return {
          ruleId: 'secrets-detect-high-entropy',
          ruleName: 'Block Leaked High-Entropy Secrets and Credentials',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: `Potential credential leakage intercepted in '${first.location || 'params'}': ${first.secretType} [${first.redactedText}] (entropy: ${first.entropy})${countDesc}`,
        };
      }

      return null;
    },
  };
}

export const highEntropySecretGuardRule: SentinelRule = createHighEntropySecretGuardRule();
