/**
 * GitHub Personal Access Token (PAT) & Credential Scrubber.
 * Detects, redacts, and blocks GitHub credentials across tool call parameters,
 * Git remote URLs, and execution environments.
 *
 * Covers:
 * - Fine-grained Personal Access Tokens (`github_pat_...`)
 * - Classic Personal Access Tokens (`ghp_...`)
 * - OAuth Access Tokens (`gho_...`)
 * - User-to-Server Tokens (`ghu_...`)
 * - Server-to-Server App Tokens (`ghs_...`)
 * - App Refresh Tokens (`ghr_...`)
 * - Git URL embedded credentials (`https://<token>@github.com/...`)
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export type GitHubTokenType =
  | 'FineGrainedPAT'
  | 'ClassicPAT'
  | 'OAuthToken'
  | 'UserToServerToken'
  | 'ServerToServerToken'
  | 'RefreshToken'
  | 'LegacyHexPAT';

export interface GitHubTokenMatch {
  tokenType: GitHubTokenType;
  rawToken: string;
  redactedToken: string;
  startIndex: number;
  endIndex: number;
  paramLocation?: string;
  prefix?: string;
}

export interface GitHubScrubResult {
  hasMatches: boolean;
  scrubbedText: string;
  matches: GitHubTokenMatch[];
}

export interface ScrubGitHubTokenOptions {
  replacement?: string;
  contextHint?: string;
}

export interface GitHubTokenRuleOptions {
  mode?: 'block' | 'redact';
  replacement?: string;
}

// GitHub fine-grained PAT: "github_pat_" followed by 70-95 alphanumeric/underscore characters (standard: 82 chars)
export const GITHUB_FINE_GRAINED_PAT_REGEX = /\bgithub_pat_[a-zA-Z0-9_]{70,95}\b/g;

// GitHub standard prefixed tokens: ghp (PAT), gho (OAuth), ghu (User), ghs (Server/Installation) followed by 36 characters
export const GITHUB_STANDARD_PREFIX_REGEX = /\b(ghp|gho|ghu|ghs)_[a-zA-Z0-9]{36}\b/g;

// GitHub Refresh tokens: ghr_ followed by 36 to 80 characters
export const GITHUB_REFRESH_TOKEN_REGEX = /\bghr_[a-zA-Z0-9]{36,80}\b/g;

// Git clone/remote URL embedding a GitHub token: https://<token>@github.com/...
export const GITHUB_URL_EMBEDDED_TOKEN_REGEX =
  /https:\/\/(github_pat_[a-zA-Z0-9_]{70,95}|(?:ghp|gho|ghu|ghs|ghr)_[a-zA-Z0-9]{36,80}|[a-f0-9]{40})@github\.com/gi;

// Legacy 40-hex GitHub token assignment regex
export const GITHUB_LEGACY_ASSIGNMENT_REGEX =
  /(?:GITHUB_TOKEN|GH_TOKEN|github_token|gh_token)\s*[:=\s]\s*['"]?([a-f0-9]{40})['"]?/gi;

/**
 * Masks a GitHub token, preserving prefix and last 4 characters.
 * e.g. "ghp_1234567890abcdef1234567890abcdef1234" -> "ghp_***1234"
 * e.g. "github_pat_123..." -> "github_pat_***abcd"
 */
export function maskGitHubToken(token: string): string {
  if (!token || token.length < 8) return 'gh_***';

  if (token.startsWith('github_pat_')) {
    const suffix = token.slice(-4);
    return `github_pat_***${suffix}`;
  }

  const prefixMatch = token.match(/^(gh[posur])_/);
  if (prefixMatch) {
    const prefix = prefixMatch[0];
    const suffix = token.slice(-4);
    return `${prefix}***${suffix}`;
  }

  const suffix = token.slice(-4);
  return `gh_***${suffix}`;
}

/**
 * Maps a token string to its GitHub token type.
 */
function classifyGitHubToken(token: string): GitHubTokenType {
  if (token.startsWith('github_pat_')) return 'FineGrainedPAT';
  if (token.startsWith('ghp_')) return 'ClassicPAT';
  if (token.startsWith('gho_')) return 'OAuthToken';
  if (token.startsWith('ghu_')) return 'UserToServerToken';
  if (token.startsWith('ghs_')) return 'ServerToServerToken';
  if (token.startsWith('ghr_')) return 'RefreshToken';
  return 'LegacyHexPAT';
}

/**
 * Detects all GitHub tokens in the provided text.
 */
export function detectGitHubTokens(text: string, contextHint?: string): GitHubTokenMatch[] {
  if (!text || typeof text !== 'string') return [];

  const matches: GitHubTokenMatch[] = [];

  // Helper to record match without duplicate index
  function addMatch(tokenType: GitHubTokenType, rawToken: string, index: number, prefix?: string): void {
    if (!matches.some((m) => m.startIndex === index && m.rawToken === rawToken)) {
      matches.push({
        tokenType,
        rawToken,
        redactedToken: maskGitHubToken(rawToken),
        startIndex: index,
        endIndex: index + rawToken.length,
        prefix,
      });
    }
  }

  // 1. Fine-grained PATs
  GITHUB_FINE_GRAINED_PAT_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = GITHUB_FINE_GRAINED_PAT_REGEX.exec(text)) !== null) {
    addMatch('FineGrainedPAT', match[0], match.index, 'github_pat_');
  }

  // 2. Standard Prefixed tokens (ghp_, gho_, ghu_, ghs_)
  GITHUB_STANDARD_PREFIX_REGEX.lastIndex = 0;
  while ((match = GITHUB_STANDARD_PREFIX_REGEX.exec(text)) !== null) {
    const tokenType = classifyGitHubToken(match[0]);
    addMatch(tokenType, match[0], match.index, match[1]);
  }

  // 3. Refresh tokens (ghr_)
  GITHUB_REFRESH_TOKEN_REGEX.lastIndex = 0;
  while ((match = GITHUB_REFRESH_TOKEN_REGEX.exec(text)) !== null) {
    addMatch('RefreshToken', match[0], match.index, 'ghr_');
  }

  // 4. Git URLs with embedded credentials
  GITHUB_URL_EMBEDDED_TOKEN_REGEX.lastIndex = 0;
  while ((match = GITHUB_URL_EMBEDDED_TOKEN_REGEX.exec(text)) !== null) {
    const fullMatch = match[0];
    const rawToken = match[1];
    if (rawToken) {
      const tokenIndex = match.index + fullMatch.indexOf(rawToken);
      const tokenType = classifyGitHubToken(rawToken);
      addMatch(tokenType, rawToken, tokenIndex);
    }
  }

  // 5. Legacy 40-hex token assignments or contextHint indicates GitHub token
  GITHUB_LEGACY_ASSIGNMENT_REGEX.lastIndex = 0;
  while ((match = GITHUB_LEGACY_ASSIGNMENT_REGEX.exec(text)) !== null) {
    const fullMatch = match[0];
    const rawToken = match[1];
    if (rawToken) {
      const tokenIndex = match.index + fullMatch.indexOf(rawToken);
      addMatch('LegacyHexPAT', rawToken, tokenIndex);
    }
  }

  if (contextHint && /(?:github_token|gh_token|github_pat)/i.test(contextHint)) {
    const legacyHexMatch = text.match(/\b[a-f0-9]{40}\b/i);
    if (legacyHexMatch && legacyHexMatch.index !== undefined) {
      addMatch('LegacyHexPAT', legacyHexMatch[0], legacyHexMatch.index);
    }
  }

  return matches;
}

/**
 * Scans a string, identifies all GitHub tokens, and replaces them with redacted equivalents.
 */
export function scrubGitHubTokens(text: string, options?: ScrubGitHubTokenOptions): GitHubScrubResult {
  if (!text || typeof text !== 'string') {
    return { hasMatches: false, scrubbedText: text || '', matches: [] };
  }

  const matches = detectGitHubTokens(text, options?.contextHint);
  if (matches.length === 0) {
    return { hasMatches: false, scrubbedText: text, matches: [] };
  }

  let scrubbedText = text;
  const customReplacement = options?.replacement;

  for (const m of matches) {
    const replacement = customReplacement ?? m.redactedToken;
    scrubbedText = scrubbedText.split(m.rawToken).join(replacement);
  }

  return {
    hasMatches: true,
    scrubbedText,
    matches,
  };
}

/**
 * Recursively scans tool context parameters for GitHub tokens.
 */
export function scanContextForGitHubTokens(ctx: ToolCallContext): GitHubTokenMatch[] {
  if (!ctx.params || typeof ctx.params !== 'object') {
    return [];
  }

  const found: GitHubTokenMatch[] = [];

  function traverse(obj: unknown, path: string): void {
    if (obj === null || obj === undefined) return;

    if (typeof obj === 'string') {
      const matches = detectGitHubTokens(obj, path);
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
 * Recursively redacts GitHub tokens from parameters object.
 */
export function redactGitHubTokensInParams(
  params: Record<string, any>,
  options?: ScrubGitHubTokenOptions
): Record<string, any> {
  function mutateDeep(obj: unknown, path: string): unknown {
    if (typeof obj === 'string') {
      const scrubbed = scrubGitHubTokens(obj, { ...options, contextHint: path });
      return scrubbed.scrubbedText;
    } else if (Array.isArray(obj)) {
      return obj.map((item, idx) => mutateDeep(item, `${path}[${idx}]`));
    } else if (obj !== null && typeof obj === 'object') {
      const res: Record<string, any> = {};
      for (const [k, v] of Object.entries(obj)) {
        res[k] = mutateDeep(v, path ? `${path}.${k}` : k);
      }
      return res;
    }
    return obj;
  }

  return mutateDeep(params, '') as Record<string, any>;
}

/**
 * Creates an AgentSentinel security rule to block or redact GitHub tokens.
 */
export function createGitHubTokenScrubberRule(options: GitHubTokenRuleOptions = {}): SentinelRule {
  const {
    mode = 'block',
    replacement = '[REDACTED_GITHUB_TOKEN]',
  } = options;

  return {
    id: 'secrets-github-token-scrubber',
    name: 'Scrub and Block Leaked GitHub Personal Access Tokens and App Credentials',
    category: 'secrets',
    priority: 980,
    enabled: true,

    evaluate(ctx: ToolCallContext): RuleViolation | null {
      const matches = scanContextForGitHubTokens(ctx);

      if (matches.length === 0) {
        return null;
      }

      const types = Array.from(new Set(matches.map((m) => m.tokenType))).join(', ');
      const locations = matches
        .map((m) => m.paramLocation)
        .filter(Boolean)
        .join(', ');

      if (mode === 'redact') {
        return {
          ruleId: 'secrets-github-token-scrubber',
          ruleName: 'Scrub and Block Leaked GitHub Personal Access Tokens and App Credentials',
          severity: 'critical',
          verdict: Verdict.REDACT,
          reason: `Leaked GitHub token intercepted and redacted: ${types}${locations ? ` in [${locations}]` : ''}`,
          redactedParams: redactGitHubTokensInParams(ctx.params, { replacement }),
        };
      }

      return {
        ruleId: 'secrets-github-token-scrubber',
        ruleName: 'Scrub and Block Leaked GitHub Personal Access Tokens and App Credentials',
        severity: 'critical',
        verdict: Verdict.BLOCK,
        reason: `Disallowed GitHub token leaked in tool parameters: ${types}${locations ? ` in [${locations}]` : ''}`,
      };
    },
  };
}

export const githubTokenScrubberRule: SentinelRule = createGitHubTokenScrubberRule();
