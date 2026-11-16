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
import { SentinelRule, ToolCallContext } from '../types.js';
export type GitHubTokenType = 'FineGrainedPAT' | 'ClassicPAT' | 'OAuthToken' | 'UserToServerToken' | 'ServerToServerToken' | 'RefreshToken' | 'LegacyHexPAT';
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
export declare const GITHUB_FINE_GRAINED_PAT_REGEX: RegExp;
export declare const GITHUB_STANDARD_PREFIX_REGEX: RegExp;
export declare const GITHUB_REFRESH_TOKEN_REGEX: RegExp;
export declare const GITHUB_URL_EMBEDDED_TOKEN_REGEX: RegExp;
export declare const GITHUB_LEGACY_ASSIGNMENT_REGEX: RegExp;
/**
 * Masks a GitHub token, preserving prefix and last 4 characters.
 * e.g. "ghp_1234567890abcdef1234567890abcdef1234" -> "ghp_***1234"
 * e.g. "github_pat_123..." -> "github_pat_***abcd"
 */
export declare function maskGitHubToken(token: string): string;
/**
 * Detects all GitHub tokens in the provided text.
 */
export declare function detectGitHubTokens(text: string, contextHint?: string): GitHubTokenMatch[];
/**
 * Scans a string, identifies all GitHub tokens, and replaces them with redacted equivalents.
 */
export declare function scrubGitHubTokens(text: string, options?: ScrubGitHubTokenOptions): GitHubScrubResult;
/**
 * Recursively scans tool context parameters for GitHub tokens.
 */
export declare function scanContextForGitHubTokens(ctx: ToolCallContext): GitHubTokenMatch[];
/**
 * Recursively redacts GitHub tokens from parameters object.
 */
export declare function redactGitHubTokensInParams(params: Record<string, any>, options?: ScrubGitHubTokenOptions): Record<string, any>;
/**
 * Creates an AgentSentinel security rule to block or redact GitHub tokens.
 */
export declare function createGitHubTokenScrubberRule(options?: GitHubTokenRuleOptions): SentinelRule;
export declare const githubTokenScrubberRule: SentinelRule;
//# sourceMappingURL=github_token_scrubber.d.ts.map