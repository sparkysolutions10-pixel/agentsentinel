/**
 * High-Entropy Secret & Credential Pattern Matcher.
 * Scans tool call parameters and payloads for leaked API keys, tokens,
 * passwords, and high-entropy cryptographic strings.
 */
import { SentinelRule, ToolCallContext } from '../types.js';
export { calculateShannonEntropy } from './shannon_entropy.js';
export interface SecretMatchResult {
    secretType: string;
    matchedText: string;
    redactedText: string;
    entropy: number;
    location?: string;
}
/**
 * Redacts secret string, preserving first and last 3 characters for diagnosis.
 */
export declare function redactSecret(secret: string): string;
/**
 * Scans a plain text string for high-entropy secrets and credential signatures.
 */
export declare function scanStringForSecrets(text: string, minEntropyThreshold?: number): SecretMatchResult[];
/**
 * Recursively scans arbitrary tool call parameters for secrets.
 */
export declare function scanContextForSecrets(ctx: ToolCallContext, minEntropyThreshold?: number): SecretMatchResult[];
export interface HighEntropySecretGuardOptions {
    minEntropyThreshold?: number;
    ignoreFields?: string[];
}
/**
 * Creates SentinelRule to guard against credential leakage in tool parameters.
 */
export declare function createHighEntropySecretGuardRule(options?: HighEntropySecretGuardOptions): SentinelRule;
export declare const highEntropySecretGuardRule: SentinelRule;
//# sourceMappingURL=entropy_matcher.d.ts.map