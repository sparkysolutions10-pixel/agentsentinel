/**
 * AgentSentinel
 * The Universal Zero-Trust Security Firewall & Runtime Guard for AI Agents & MCP.
 */
import { SentinelRule, ToolCallContext, EvaluationResult, BeforeExecuteHook, AfterExecuteHook, OnViolationHook, EvaluateOptions } from './types.js';
import { RuleRegistry } from './ruleset.js';
import { DeclarativePolicyConfig } from './policy.js';
import { JSONAuditLogger, AuditEventSink } from './logger.js';
import { ConfirmationBridge } from './confirm.js';
export * from './types.js';
export * from './context.js';
export * from './ruleset.js';
export * from './policy.js';
export * from './timer.js';
export * from './logger.js';
export * from './integrity.js';
export * from './queue.js';
export * from './confirm.js';
export * from './matcher.js';
export * from './shell/index.js';
export * from './sql/index.js';
export * from './fs/index.js';
export * from './secrets/index.js';
export * from './mcp/index.js';
export * from './sdk/index.js';
export * from './cli/index.js';
export * from './benchmarks/index.js';
export * from './rules/index.js';
export * from './rag/index.js';
export * from './armor/index.js';
export * from './web3/index.js';
export * from './utils/index.js';
export declare class SentinelEngine {
    readonly registry: RuleRegistry;
    readonly logger: JSONAuditLogger;
    confirmationBridge?: ConfirmationBridge;
    dryRun: boolean;
    private beforeHooks;
    private afterHooks;
    private violationHooks;
    private ruleInjectedListeners;
    private ruleRevokedListeners;
    constructor(loggerSink?: AuditEventSink, hmacKey?: string, maxLogCapacity?: number, options?: {
        dryRun?: boolean;
    });
    setDryRun(enabled: boolean): this;
    registerRule(rule: SentinelRule): this;
    registerRules(rules: SentinelRule[]): this;
    loadPolicy(rawConfig: DeclarativePolicyConfig | unknown): this;
    /**
     * Dynamically injects or hot-swaps a rule into the active engine at runtime.
     */
    injectRule(rule: SentinelRule): this;
    /**
     * Dynamically injects a declarative policy at runtime.
     * Returns list of injected rule IDs.
     */
    injectPolicy(rawConfig: DeclarativePolicyConfig | unknown): string[];
    /**
     * Revokes an active rule at runtime. Returns true if removed, false otherwise.
     */
    revokeRule(ruleId: string): boolean;
    /**
     * Revokes multiple rules by IDs at runtime. Returns number of removed rules.
     */
    revokeRules(ruleIds: string[]): number;
    enableRule(ruleId: string): boolean;
    disableRule(ruleId: string): boolean;
    hasRule(ruleId: string): boolean;
    getRule(ruleId: string): SentinelRule | undefined;
    getRegisteredRules(): SentinelRule[];
    onRuleInjected(listener: (rule: SentinelRule) => void): () => void;
    onRuleRevoked(listener: (ruleId: string) => void): () => void;
    setConfirmationBridge(bridge: ConfirmationBridge): this;
    beforeExecute(hook: BeforeExecuteHook): this;
    afterExecute(hook: AfterExecuteHook): this;
    onViolation(hook: OnViolationHook): this;
    evaluate(context: ToolCallContext, options?: EvaluateOptions): Promise<EvaluationResult>;
}
export * from './crypto/index.js';
//# sourceMappingURL=index.d.ts.map