/**
 * OpenAI, Anthropic, and LLM Provider API Key Scrubber & Guard.
 * Detects, redacts, and blocks leaked AI model API keys (e.g. `sk-proj-...`, `sk-ant-...`)
 * across tool call parameters, headers, and environment payloads.
 */
import { SentinelRule, ToolCallContext } from '../types.js';
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
/**
 * Redacts an LLM key preserving provider prefix (e.g. sk-proj-) and 4 suffix chars.
 */
export declare function maskLLMKey(key: string): string;
export interface ScrubLLMKeysOptions {
    replacement?: string;
}
/**
 * Scans a string, identifies all LLM API keys, and returns the scrubbed string.
 * Supports custom replacement string (e.g. '[REDACTED_API_KEY]').
 */
export declare function scrubLLMKeys(text: string, options?: ScrubLLMKeysOptions): LLMScrubResult;
/**
 * Recursively scans tool context parameters for LLM keys.
 */
export declare function scanContextForLLMKeys(ctx: ToolCallContext): LLMKeyMatch[];
export interface LLMKeyScrubberOptions {
    mode?: 'block' | 'redact';
    replacement?: string;
}
/**
 * Creates SentinelRule to intercept or redact OpenAI/Anthropic/Google LLM keys.
 */
export declare function createLLMKeyScrubberRule(options?: LLMKeyScrubberOptions): SentinelRule;
export declare const llmKeyScrubberRule: SentinelRule;
//# sourceMappingURL=llm_key_scrubber.d.ts.map