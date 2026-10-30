/**
 * AWS Access Key and Secret Key Detector & Redactor.
 * Detects, redacts, and blocks AWS Access Key IDs (AKIA, ASIA, etc.),
 * Secret Access Keys, and STS Session Tokens across tool parameters,
 * headers, and execution environments.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export type AWSKeyType = 'AccessKeyId' | 'SecretAccessKey' | 'SessionToken' | 'AuthorizationHeader';

export interface AWSKeyMatch {
  keyType: AWSKeyType;
  rawKey: string;
  redactedKey: string;
  startIndex: number;
  endIndex: number;
  paramLocation?: string;
  prefix?: string;
}

export interface AWSScrubResult {
  hasMatches: boolean;
  scrubbedText: string;
  matches: AWSKeyMatch[];
}

export interface ScrubAWSOptions {
  replacement?: string;
}

export interface AWSKeyDetectorOptions {
  mode?: 'block' | 'redact';
  blockOnAccessKey?: boolean;
  blockOnSecretKey?: boolean;
  blockOnSessionToken?: boolean;
  replacement?: string;
}

// AWS Access Key ID standard 20-character regex (AKIA, ASIA, ABIA, ACCA, APKA, AGPA, AIDA, AROA, AIPA)
export const AWS_ACCESS_KEY_ID_REGEX = /\b(AKIA|ASIA|ABIA|ACCA|APKA|AGPA|AIDA|AROA|AIPA)[A-Z0-9]{16}\b/g;

// AWS Secret Access Key patterns (40 base64 chars with context/assignment/flag)
export const AWS_SECRET_KEY_ASSIGNMENT_REGEX =
  /(?:aws_secret_access_key|secret_key|AWS_SECRET_ACCESS_KEY|SecretAccessKey|--aws-secret-access-key|AWS_SECRET_KEY)\s*[:=\s]\s*['"]?([A-Za-z0-9/+=]{40})['"]?/gi;

// Standalone high-entropy 40-char secret key pattern (when context suggests AWS)
export const AWS_SECRET_KEY_STANDALONE_REGEX = /(?<![A-Za-z0-9/+=])[A-Za-z0-9/+=]{40}(?![A-Za-z0-9/+=])/g;

// AWS STS Session Token patterns (headers, CLI flags, assignments)
export const AWS_SESSION_TOKEN_REGEX =
  /(?:aws_session_token|AWS_SESSION_TOKEN|X-Amz-Security-Token|--aws-session-token|SessionToken)\s*[:=\s]\s*['"]?([A-Za-z0-9/+=]{80,})['"]?/gi;

// AWS Authorization header pattern (AWS4-HMAC-SHA256)
export const AWS_AUTH_HEADER_REGEX = /AWS4-HMAC-SHA256\s+Credential=([A-Z0-9]{20})\/([0-9]{8})\/([a-z0-9-]+)\/([a-z0-9-]+)\/aws4_request/g;

/**
 * Masks an AWS Access Key ID, preserving its 4-character prefix and 4 suffix characters.
 * e.g. "AKIAIOSFODNN7EXAMPLE" -> "AKIA***MPLE"
 */
export function maskAWSAccessKey(key: string): string {
  if (!key || key.length < 8) return 'AKIA***';
  const prefix = key.slice(0, 4);
  const suffix = key.slice(-4);
  return `${prefix}***${suffix}`;
}

/**
 * Masks an AWS Secret Access Key.
 */
export function maskAWSSecretKey(key: string): string {
  if (!key || key.length < 8) return 'aws_sec_***';
  return 'aws_sec_***' + key.slice(-4);
}

/**
 * Detects AWS credentials in a given text string.
 */
export function detectAWSKeys(text: string): AWSKeyMatch[] {
  if (!text || typeof text !== 'string') return [];

  const matches: AWSKeyMatch[] = [];

  // 1. Detect AWS Access Key IDs
  AWS_ACCESS_KEY_ID_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = AWS_ACCESS_KEY_ID_REGEX.exec(text)) !== null) {
    const rawKey = match[0];
    matches.push({
      keyType: 'AccessKeyId',
      rawKey,
      redactedKey: maskAWSAccessKey(rawKey),
      startIndex: match.index,
      endIndex: match.index + rawKey.length,
      prefix: match[1],
    });
  }

  // 2. Detect AWS Secret Keys from assignments and flags
  AWS_SECRET_KEY_ASSIGNMENT_REGEX.lastIndex = 0;
  while ((match = AWS_SECRET_KEY_ASSIGNMENT_REGEX.exec(text)) !== null) {
    const fullMatch = match[0];
    const rawKey = match[1];
    if (rawKey) {
      const keyIndex = match.index + fullMatch.indexOf(rawKey);
      // Avoid duplicate matches
      if (!matches.some((m) => m.startIndex === keyIndex)) {
        matches.push({
          keyType: 'SecretAccessKey',
          rawKey,
          redactedKey: maskAWSSecretKey(rawKey),
          startIndex: keyIndex,
          endIndex: keyIndex + rawKey.length,
        });
      }
    }
  }

  // 3. Detect AWS STS Session Tokens
  AWS_SESSION_TOKEN_REGEX.lastIndex = 0;
  while ((match = AWS_SESSION_TOKEN_REGEX.exec(text)) !== null) {
    const fullMatch = match[0];
    const rawKey = match[1];
    if (rawKey) {
      const keyIndex = match.index + fullMatch.indexOf(rawKey);
      if (!matches.some((m) => m.startIndex === keyIndex)) {
        matches.push({
          keyType: 'SessionToken',
          rawKey,
          redactedKey: 'aws_tok_***' + rawKey.slice(-4),
          startIndex: keyIndex,
          endIndex: keyIndex + rawKey.length,
        });
      }
    }
  }

  return matches;
}

/**
 * Scans a string, identifies all AWS credentials, and replaces them with redacted equivalents.
 */
export function scrubAWSKeys(text: string, options?: ScrubAWSOptions): AWSScrubResult {
  if (!text || typeof text !== 'string') {
    return { hasMatches: false, scrubbedText: text || '', matches: [] };
  }

  const matches = detectAWSKeys(text);
  if (matches.length === 0) {
    return { hasMatches: false, scrubbedText: text, matches: [] };
  }

  let scrubbedText = text;
  const customReplacement = options?.replacement;

  // Replace each detected secret
  for (const m of matches) {
    const replacement = customReplacement ?? m.redactedKey;
    scrubbedText = scrubbedText.split(m.rawKey).join(replacement);
  }

  return {
    hasMatches: true,
    scrubbedText,
    matches,
  };
}

/**
 * Recursively scans tool context parameters for AWS keys.
 */
export function scanContextForAWSKeys(ctx: ToolCallContext): AWSKeyMatch[] {
  if (!ctx.params || typeof ctx.params !== 'object') {
    return [];
  }

  const found: AWSKeyMatch[] = [];

  function traverse(obj: unknown, path: string): void {
    if (obj === null || obj === undefined) return;

    if (typeof obj === 'string') {
      const matches = detectAWSKeys(obj);
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
 * Recursively redacts AWS credentials from parameters object.
 */
export function redactAWSKeysInParams(params: Record<string, any>, options?: ScrubAWSOptions): Record<string, any> {
  function mutateDeep(obj: unknown): unknown {
    if (typeof obj === 'string') {
      const scrubbed = scrubAWSKeys(obj, options);
      return scrubbed.scrubbedText;
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

  return mutateDeep(params) as Record<string, any>;
}

/**
 * Creates an AgentSentinel security rule to block or redact AWS credentials.
 */
export function createAWSKeyDetectorRule(options: AWSKeyDetectorOptions = {}): SentinelRule {
  const {
    mode = 'block',
    blockOnAccessKey = true,
    blockOnSecretKey = true,
    blockOnSessionToken = true,
    replacement = '[REDACTED_AWS_CREDENTIAL]',
  } = options;

  return {
    id: 'secrets-aws-credential-detector',
    name: 'Scrub and Block Leaked AWS Access Keys, Secret Keys, and Session Tokens',
    category: 'secrets',
    priority: 985,
    enabled: true,

    evaluate(ctx: ToolCallContext): RuleViolation | null {
      const matches = scanContextForAWSKeys(ctx);

      if (matches.length === 0) {
        return null;
      }

      // Check whether to block based on configured key types
      const shouldBlock = matches.some((m) => {
        if (m.keyType === 'AccessKeyId' && blockOnAccessKey) return true;
        if (m.keyType === 'SecretAccessKey' && blockOnSecretKey) return true;
        if (m.keyType === 'SessionToken' && blockOnSessionToken) return true;
        return false;
      });

      if (shouldBlock) {
        const types = Array.from(new Set(matches.map((m) => m.keyType))).join(', ');
        const locations = matches
          .map((m) => m.paramLocation)
          .filter(Boolean)
          .join(', ');

        if (mode === 'redact') {
          return {
            ruleId: 'secrets-aws-credential-detector',
            ruleName: 'Scrub and Block Leaked AWS Access Keys, Secret Keys, and Session Tokens',
            severity: 'critical',
            verdict: Verdict.REDACT,
            reason: `Leaked AWS credential intercepted and redacted: ${types}${locations ? ` in [${locations}]` : ''}`,
            redactedParams: redactAWSKeysInParams(ctx.params, { replacement }),
          };
        }

        return {
          ruleId: 'secrets-aws-credential-detector',
          ruleName: 'Scrub and Block Leaked AWS Access Keys, Secret Keys, and Session Tokens',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: `Disallowed AWS credential leaked in tool parameters: ${types}${locations ? ` in [${locations}]` : ''}`,
        };
      }

      return null;
    },
  };
}

export const awsKeyDetectorRule: SentinelRule = createAWSKeyDetectorRule();
