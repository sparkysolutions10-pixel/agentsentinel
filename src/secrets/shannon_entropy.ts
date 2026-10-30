/**
 * Shannon Entropy Calculator and High-Entropy Token Detector.
 * Computes exact information entropy $H(X) = -\sum p(x) \log_2 p(x)$ for arbitrary
 * strings, normalizes against theoretical maximum entropy for detected character sets
 * (Hex, Base32, Base64, ASCII), and scans text for high-entropy secret tokens.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export type TokenCharacterSet = 'hex' | 'base32' | 'base64' | 'alphanumeric' | 'ascii';

export interface EntropyAnalysis {
  token: string;
  length: number;
  entropy: number;
  normalizedEntropy: number;
  characterSet: TokenCharacterSet;
  isHighEntropy: boolean;
}

export interface EntropyTokenMatch extends EntropyAnalysis {
  startIndex: number;
  endIndex: number;
  paramLocation?: string;
}

export interface EntropyThresholds {
  hex?: number; // default: 3.2 (max: 4.0)
  base32?: number; // default: 3.8 (max: 5.0)
  base64?: number; // default: 4.5 (max: 6.0)
  general?: number; // default: 3.8
  minLength?: number; // default: 16
}

export interface ShannonEntropyRuleOptions {
  mode?: 'block' | 'redact';
  thresholds?: EntropyThresholds;
  replacement?: string;
  ignoredPrefixes?: string[];
}

/**
 * Calculates raw Shannon entropy in bits per character.
 */
export function calculateShannonEntropy(str: string): number {
  if (!str || str.length === 0) return 0;

  const frequencies = new Map<string, number>();
  const len = str.length;

  for (let i = 0; i < len; i++) {
    const char = str[i];
    frequencies.set(char, (frequencies.get(char) || 0) + 1);
  }

  let entropy = 0;
  for (const count of frequencies.values()) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }

  return entropy;
}

/**
 * Detects the predominant character set of a token.
 */
export function detectTokenCharacterSet(str: string): TokenCharacterSet {
  if (!str) return 'ascii';

  if (/^[0-9a-fA-F]+$/.test(str)) {
    return 'hex';
  }
  if (/^[2-7A-Z]+=*$/.test(str)) {
    return 'base32';
  }
  if (/^[A-Za-z0-9+/=]+$/.test(str)) {
    return 'base64';
  }
  if (/^[A-Za-z0-9_-]+$/.test(str)) {
    return 'alphanumeric';
  }
  return 'ascii';
}

/**
 * Returns the theoretical maximum entropy for a given character set.
 */
export function getMaxEntropyForCharset(charset: TokenCharacterSet): number {
  switch (charset) {
    case 'hex':
      return 4.0; // log2(16)
    case 'base32':
      return 5.0; // log2(32)
    case 'base64':
      return 6.0; // log2(64)
    case 'alphanumeric':
      return 5.95; // log2(62)
    case 'ascii':
    default:
      return 6.57; // log2(95 printable ASCII)
  }
}

/**
 * Evaluates full entropy profile and determines if token exceeds threshold.
 */
export function analyzeTokenEntropy(
  token: string,
  thresholds: EntropyThresholds = {}
): EntropyAnalysis {
  const {
    hex = 3.2,
    base32 = 3.8,
    base64 = 4.5,
    general = 3.8,
    minLength = 16,
  } = thresholds;

  const entropy = calculateShannonEntropy(token);
  const characterSet = detectTokenCharacterSet(token);
  const maxEntropy = getMaxEntropyForCharset(characterSet);
  const normalizedEntropy = maxEntropy > 0 ? entropy / maxEntropy : 0;

  let isHighEntropy = false;

  if (token.length >= minLength) {
    let targetThreshold = general;
    if (characterSet === 'hex') targetThreshold = hex;
    else if (characterSet === 'base32') targetThreshold = base32;
    else if (characterSet === 'base64') targetThreshold = base64;

    isHighEntropy = entropy >= targetThreshold;
  }

  return {
    token,
    length: token.length,
    entropy,
    normalizedEntropy,
    characterSet,
    isHighEntropy,
  };
}

// Regex matching candidate token words (16 to 128 characters)
const TOKEN_WORD_REGEX = /\b[A-Za-z0-9_+/=-]{16,128}\b/g;

/**
 * Scans a text string and extracts all high-entropy secret tokens.
 */
export function scanTextForHighEntropyTokens(
  text: string,
  thresholds: EntropyThresholds = {},
  ignoredPrefixes: string[] = []
): EntropyTokenMatch[] {
  if (!text || typeof text !== 'string') return [];

  const matches: EntropyTokenMatch[] = [];
  TOKEN_WORD_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = TOKEN_WORD_REGEX.exec(text)) !== null) {
    const rawToken = match[0];

    // Check ignored prefixes (e.g. non-secret prefixes or common hashes)
    const isIgnored = ignoredPrefixes.some((p) => rawToken.startsWith(p));
    if (!isIgnored) {
      const analysis = analyzeTokenEntropy(rawToken, thresholds);
      if (analysis.isHighEntropy) {
        matches.push({
          ...analysis,
          startIndex: match.index,
          endIndex: match.index + rawToken.length,
        });
      }
    }
  }

  return matches;
}

/**
 * Recursively scans tool context parameters for high-entropy tokens.
 */
export function scanContextForEntropyTokens(
  ctx: ToolCallContext,
  thresholds?: EntropyThresholds,
  ignoredPrefixes?: string[]
): EntropyTokenMatch[] {
  if (!ctx.params || typeof ctx.params !== 'object') {
    return [];
  }

  const found: EntropyTokenMatch[] = [];

  function traverse(obj: unknown, path: string): void {
    if (obj === null || obj === undefined) return;

    if (typeof obj === 'string') {
      const matches = scanTextForHighEntropyTokens(obj, thresholds, ignoredPrefixes);
      for (const m of matches) {
        found.push({
          ...m,
          paramLocation: path,
        });
      }
    } else if (Array.isArray(obj)) {
      obj.forEach((item, idx) => traverse(item, `${path}[${idx}]`));
    } else if (typeof obj === 'object') {
      for (const [key, value] of Object.entries(obj)) {
        traverse(value, path ? `${path}.${key}` : key);
      }
    }
  }

  traverse(ctx.params, '');
  return found;
}

/**
 * Creates an AgentSentinel security rule to block or redact arbitrary high-entropy tokens.
 */
export function createShannonEntropyRule(options: ShannonEntropyRuleOptions = {}): SentinelRule {
  const {
    mode = 'block',
    thresholds,
    replacement = '[HIGH_ENTROPY_TOKEN_REDACTED]',
    ignoredPrefixes = [],
  } = options;

  return {
    id: 'secrets-shannon-entropy-rule',
    name: 'Block and Redact High-Entropy Arbitrary Secret Tokens',
    category: 'secrets',
    priority: 950,
    enabled: true,

    evaluate(ctx: ToolCallContext): RuleViolation | null {
      const matches = scanContextForEntropyTokens(ctx, thresholds, ignoredPrefixes);

      if (matches.length === 0) {
        return null;
      }

      const locations = matches
        .map((m) => m.paramLocation)
        .filter(Boolean)
        .join(', ');

      if (mode === 'redact') {
        function mutateDeep(obj: unknown): unknown {
          if (typeof obj === 'string') {
            let res = obj;
            const tokenMatches = scanTextForHighEntropyTokens(obj, thresholds, ignoredPrefixes);
            for (const t of tokenMatches) {
              res = res.split(t.token).join(replacement);
            }
            return res;
          } else if (Array.isArray(obj)) {
            return obj.map((item) => mutateDeep(item));
          } else if (obj !== null && typeof obj === 'object') {
            const res: Record<string, any> = {};
            for (const [k, v] of Object.entries(obj)) {
              res[k] = mutateDeep(v);
            }
            return res;
          }
          return obj;
        }

        return {
          ruleId: 'secrets-shannon-entropy-rule',
          ruleName: 'Block and Redact High-Entropy Arbitrary Secret Tokens',
          severity: 'high',
          verdict: Verdict.REDACT,
          reason: `High-entropy secret token intercepted and redacted (${matches.length} tokens found)${locations ? ` in [${locations}]` : ''}`,
          redactedParams: mutateDeep(ctx.params) as Record<string, any>,
        };
      }

      return {
        ruleId: 'secrets-shannon-entropy-rule',
        ruleName: 'Block and Redact High-Entropy Arbitrary Secret Tokens',
        severity: 'high',
        verdict: Verdict.BLOCK,
        reason: `Disallowed high-entropy secret token leaked in tool parameters: ${matches.length} token(s) detected with entropy >= threshold${locations ? ` in [${locations}]` : ''}`,
      };
    },
  };
}

export const shannonEntropyRule: SentinelRule = createShannonEntropyRule();
