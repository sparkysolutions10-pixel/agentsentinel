import { Verdict, ToolCategory, SentinelRule } from './types.js';
export interface DeclarativeRuleMatch {
    tools?: string[];
    patterns?: string[];
    paramMatch?: Record<string, any>;
}
export interface DeclarativeRuleAction {
    verdict: Verdict;
    reason: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    redactKeys?: string[];
}
export interface DeclarativeRuleDefinition {
    id: string;
    name: string;
    category: ToolCategory;
    priority: number;
    enabled?: boolean;
    match: DeclarativeRuleMatch;
    action: DeclarativeRuleAction;
}
export interface DeclarativePolicyConfig {
    version: string;
    rules: DeclarativeRuleDefinition[];
}
/**
 * Validates a declarative JSON policy config against the AgentSentinel schema.
 */
export declare function validatePolicyConfig(raw: unknown): DeclarativePolicyConfig;
/**
 * Compiles a DeclarativeRuleDefinition into an executable SentinelRule.
 */
export declare function compileDeclarativeRule(def: DeclarativeRuleDefinition): SentinelRule;
//# sourceMappingURL=policy.d.ts.map