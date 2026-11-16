/**
 * Enterprise Proprietary Token Registry & Custom Regex Scrubber.
 * Allows enterprises to register custom proprietary token schemas, internal service keys,
 * and custom regex rules with customizable masking and AgentSentinel rule enforcement.
 */
import { SentinelRule, ToolCallContext } from '../types.js';
export interface EnterpriseTokenRule {
    name: string;
    pattern: RegExp;
    description?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    mask?: (raw: string) => string;
    replacement?: string;
    minEntropy?: number;
}
export interface CustomTokenMatch {
    ruleName: string;
    rawToken: string;
    maskedToken: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    startIndex: number;
    endIndex: number;
    paramLocation?: string;
}
export interface CustomTokenScrubResult {
    hasMatches: boolean;
    scrubbedText: string;
    matches: CustomTokenMatch[];
}
export interface EnterpriseRuleOptions {
    mode?: 'block' | 'redact';
    defaultReplacement?: string;
}
/**
 * Standard default masking preserving first 4 and last 4 characters.
 */
export declare function defaultTokenMask(token: string): string;
export declare class EnterpriseTokenRegistry {
    private rules;
    /**
     * Registers a new custom token pattern rule.
     */
    registerRule(rule: EnterpriseTokenRule): this;
    /**
     * Unregisters a custom token rule by name.
     */
    unregisterRule(name: string): boolean;
    /**
     * Clears all registered custom rules.
     */
    clear(): void;
    /**
     * Returns all currently registered rules.
     */
    getRules(): EnterpriseTokenRule[];
    /**
     * Scans text for registered proprietary enterprise tokens.
     */
    detectTokens(text: string): CustomTokenMatch[];
    /**
     * Scans text and replaces registered proprietary tokens with masked or replacement strings.
     */
    scrubTokens(text: string, customReplacement?: string): CustomTokenScrubResult;
    /**
     * Scans tool context parameters for proprietary enterprise tokens.
     */
    scanContext(ctx: ToolCallContext): CustomTokenMatch[];
    /**
     * Redacts proprietary tokens in tool call parameters.
     */
    redactParams(params: Record<string, any>, customReplacement?: string): Record<string, any>;
    /**
     * Creates an AgentSentinel SentinelRule enforcing registered enterprise token privacy.
     */
    createSentinelRule(options?: EnterpriseRuleOptions): SentinelRule;
}
export declare const defaultEnterpriseTokenRegistry: EnterpriseTokenRegistry;
//# sourceMappingURL=enterprise_token_registry.d.ts.map