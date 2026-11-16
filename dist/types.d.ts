/**
 * AgentSentinel - Core Type Definitions
 * Zero-trust runtime security firewall and AST policy interceptor for AI agents & MCP.
 */
export declare enum Verdict {
    ALLOW = "ALLOW",
    BLOCK = "BLOCK",
    REDACT = "REDACT",
    CONFIRM = "CONFIRM"
}
/**
 * Type guard checking if an arbitrary value matches a valid Verdict enum.
 */
export declare function isVerdict(value: unknown): value is Verdict;
/**
 * Asserts that a value is a valid Verdict enum, throwing TypeError otherwise.
 */
export declare function assertVerdict(value: unknown): asserts value is Verdict;
/**
 * Safely parses any case-insensitive string or value into a standardized Verdict enum.
 */
export declare function parseVerdict(value: unknown, fallback?: Verdict): Verdict;
/**
 * Numeric priority ranking of verdicts (higher number = more restrictive).
 */
export declare function getVerdictRank(verdict: Verdict): number;
export type ToolCategory = 'shell' | 'sql' | 'fs' | 'secrets' | 'network' | 'custom';
export interface ToolCallContext {
    id: string;
    agentId?: string;
    toolName: string;
    category?: ToolCategory;
    params: Record<string, any>;
    timestamp: number;
}
export interface RuleViolation {
    ruleId: string;
    ruleName: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    verdict: Verdict;
    reason: string;
    detectedPattern?: string;
    redactedParams?: Record<string, any>;
}
export interface ConfirmDecision {
    requestId: string;
    approved: boolean;
    verdict: Verdict;
    reason?: string;
    timedOut: boolean;
    latencyMs: number;
}
export interface ConfirmRequestSummary {
    requestId: string;
    toolCallId: string;
    toolName: string;
    category?: ToolCategory;
    params: Record<string, any>;
    ruleId?: string;
    reason?: string;
    prompt: string;
    createdAt: number;
    timeoutMs: number;
}
export interface EvaluateOptions {
    dryRun?: boolean;
}
export interface EvaluationResult {
    verdict: Verdict;
    allowed: boolean;
    violations: RuleViolation[];
    latencyMs: number;
    redactedParams?: Record<string, any>;
    confirmDecision?: ConfirmDecision;
    dryRun?: boolean;
    simulatedVerdict?: Verdict;
}
export interface SentinelRule {
    id: string;
    name: string;
    category: ToolCategory;
    priority: number;
    enabled: boolean;
    evaluate(context: ToolCallContext): Promise<RuleViolation | null> | RuleViolation | null;
}
export type BeforeExecuteHook = (context: ToolCallContext) => Promise<ToolCallContext | void> | ToolCallContext | void;
export type AfterExecuteHook = (context: ToolCallContext, result: EvaluationResult) => Promise<void> | void;
export type OnViolationHook = (violation: RuleViolation, context: ToolCallContext) => Promise<void> | void;
//# sourceMappingURL=types.d.ts.map