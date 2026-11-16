/**
 * Shannon Entropy Calculator and High-Entropy Token Detector.
 * Computes exact information entropy $H(X) = -\sum p(x) \log_2 p(x)$ for arbitrary
 * strings, normalizes against theoretical maximum entropy for detected character sets
 * (Hex, Base32, Base64, ASCII), and scans text for high-entropy secret tokens.
 */
import { SentinelRule, ToolCallContext } from '../types.js';
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
    hex?: number;
    base32?: number;
    base64?: number;
    general?: number;
    minLength?: number;
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
export declare function calculateShannonEntropy(str: string): number;
/**
 * Detects the predominant character set of a token.
 */
export declare function detectTokenCharacterSet(str: string): TokenCharacterSet;
/**
 * Returns the theoretical maximum entropy for a given character set.
 */
export declare function getMaxEntropyForCharset(charset: TokenCharacterSet): number;
/**
 * Evaluates full entropy profile and determines if token exceeds threshold.
 */
export declare function analyzeTokenEntropy(token: string, thresholds?: EntropyThresholds): EntropyAnalysis;
/**
 * Scans a text string and extracts all high-entropy secret tokens.
 */
export declare function scanTextForHighEntropyTokens(text: string, thresholds?: EntropyThresholds, ignoredPrefixes?: string[]): EntropyTokenMatch[];
/**
 * Recursively scans tool context parameters for high-entropy tokens.
 */
export declare function scanContextForEntropyTokens(ctx: ToolCallContext, thresholds?: EntropyThresholds, ignoredPrefixes?: string[]): EntropyTokenMatch[];
/**
 * Creates an AgentSentinel security rule to block or redact arbitrary high-entropy tokens.
 */
export declare function createShannonEntropyRule(options?: ShannonEntropyRuleOptions): SentinelRule;
export declare const shannonEntropyRule: SentinelRule;
//# sourceMappingURL=shannon_entropy.d.ts.map