/**
 * OpenAI, Anthropic, and LLM Provider API Key Scrubber & Guard.
 * Detects, redacts, and blocks leaked AI model API keys (e.g. `sk-proj-...`, `sk-ant-...`)
 * across tool call parameters, headers, and environment payloads.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export type LLMProvider = 'OpenAI' | 'Anthropic' | 'Google' | 'GenericLLM';

export interface LLMKeyMatch {
  provider: LLMProvider;
  keyType: string;
  rawKey: string;
  redactedKey: string;
  startIndex: number;
  endIndex: number;
  paramLocation?: string;
}

export interface LLMScrubResult {
  hasMatches: boolean;
  scrubbedText: string;
  matches: LLMKeyMatch[];
}

// Provider-specific regex patterns
const LLM_KEY_PATTERNS: Array<{
  provider: LLMProvider;
  keyType: string;
  pattern: RegExp;
}> = [
  // OpenAI project-based API keys (sk-proj-...)
  {
    provider: 'OpenAI',
    keyType: 'OpenAI Project Key',
    pattern: /\bsk-proj-[a-zA-Z0-9_\-]{32,}\b/g,
  },
  // OpenAI service account keys (sk-svcacct-...)
  {
    provider: 'OpenAI',
    keyType: 'OpenAI Service Account Key',
    pattern: /\bsk-svcacct-[a-zA-Z0-9_\-]{32,}\b/g,
  },
  // OpenAI admin keys (sk-admin-...)
  {
    provider: 'OpenAI',
    keyType: 'OpenAI Admin Key',
    pattern: /\bsk-admin-[a-zA-Z0-9_\-]{32,}\b/g,
  },
  // Anthropic API keys (sk-ant-api03-... or sk-ant-...)
  {
    provider: 'Anthropic',
    keyType: 'Anthropic API Key',
    pattern: /\bsk-ant-(?:api03-)?[a-zA-Z0-9_\-]{24,}\b/g,
  },
  // OpenAI legacy standard format (sk-...)
  {
    provider: 'OpenAI',
    keyType: 'OpenAI Legacy User Key',
    pattern: /\bsk-[a-zA-Z0-9]{40,}\b/g,
  },
  // Google Gemini API keys (AIzaSy...)
  {
    provider: 'Google',
    keyType: 'Google Gemini API Key',
    pattern: /\bAIzaSy[a-zA-Z0-9_\-]{33}\b/g,
  },
];

/**
 * Redacts an LLM key preserving provider prefix (e.g. sk-proj-) and 4 suffix chars.
 */
export function maskLLMKey(key: string): string {
  if (!key || key.length < 12) return 'sk-***';

  const parts = key.split('-');
  if (parts.length >= 2) {
    const prefix = parts.slice(0, 2).join('-') + '-';
    const suffix = key.slice(-4);
    return `${prefix}***${suffix}`;
  }

  const prefix = key.slice(0, 7);
  const suffix = key.slice(-4);
  return `${prefix}***${suffix}`;
}

export interface ScrubLLMKeysOptions {
  replacement?: string;
}

/**
 * Scans a string, identifies all LLM API keys, and returns the scrubbed string.
 * Supports custom replacement string (e.g. '[REDACTED_API_KEY]').
 */
export function scrubLLMKeys(text: string, options?: ScrubLLMKeysOptions): LLMScrubResult {
  if (!text || typeof text !== 'string') {
    return { hasMatches: false, scrubbedText: text || '', matches: [] };
  }

  const matches: LLMKeyMatch[] = [];
  let scrubbedText = text;
  const customReplacement = options?.replacement;

  for (const { provider, keyType, pattern } of LLM_KEY_PATTERNS) {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      const rawKey = match[0];
      const redactedKey = customReplacement ?? maskLLMKey(rawKey);

      matches.push({
        provider,
        keyType,
        rawKey,
        redactedKey,
        startIndex: match.index,
        endIndex: match.index + rawKey.length,
      });

      // Replace all occurrences in scrubbedText
      scrubbedText = scrubbedText.split(rawKey).join(redactedKey);
    }
  }

  return {
    hasMatches: matches.length > 0,
    scrubbedText,
    matches,
  };
}

/**
 * Recursively scans tool context parameters for LLM keys.
 */
export function scanContextForLLMKeys(ctx: ToolCallContext): LLMKeyMatch[] {
  if (!ctx.params || typeof ctx.params !== 'object') {
    return [];
  }

  const allMatches: LLMKeyMatch[] = [];

  function traverse(obj: unknown, currentPath: string): void {
    if (obj === null || obj === undefined) return;

    if (typeof obj === 'string') {
      const scrubbed = scrubLLMKeys(obj);
      for (const m of scrubbed.matches) {
        m.paramLocation = currentPath;
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

export interface LLMKeyScrubberOptions {
  mode?: 'block' | 'redact';
  replacement?: string;
}

/**
 * Creates SentinelRule to intercept or redact OpenAI/Anthropic/Google LLM keys.
 */
export function createLLMKeyScrubberRule(options?: LLMKeyScrubberOptions): SentinelRule {
  const mode = options?.mode ?? 'block';

  return {
    id: 'secrets-scrub-llm-api-keys',
    name: 'Scrub and Block Leaked OpenAI, Anthropic, and LLM Provider API Keys',
    category: 'secrets',
    priority: 990,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      const matches = scanContextForLLMKeys(ctx);

      if (matches.length > 0) {
        const first = matches[0];
        const providers = Array.from(new Set(matches.map((m) => m.provider))).join(', ');

        if (mode === 'block') {
          return {
            ruleId: 'secrets-scrub-llm-api-keys',
            ruleName: 'Scrub and Block Leaked OpenAI, Anthropic, and LLM Provider API Keys',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: `Leaked ${providers} API key intercepted in '${first.paramLocation || 'params'}': ${first.keyType} [${first.redactedKey}]`,
          };
        }
      }

      return null;
    },
  };
}

export const llmKeyScrubberRule: SentinelRule = createLLMKeyScrubberRule();
