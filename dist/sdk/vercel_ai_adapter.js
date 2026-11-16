/**
 * AgentSentinel Vercel AI SDK Integration Adapter.
 * Provides zero-trust runtime policy enforcement and parameter sanitization
 * for Vercel AI SDK `tool()` definitions and `execute()` callbacks.
 */
import { Verdict, } from '../types.js';
export class SentinelPolicyViolationError extends Error {
    ruleId;
    verdict;
    violations;
    toolName;
    toolCallContext;
    constructor(message, toolName, violations, context) {
        super(message);
        this.name = 'SentinelPolicyViolationError';
        this.toolName = toolName;
        this.violations = violations;
        this.verdict = violations[0]?.verdict ?? Verdict.BLOCK;
        this.ruleId = violations[0]?.ruleId ?? 'policy-violation';
        this.toolCallContext = context;
        Object.setPrototypeOf(this, SentinelPolicyViolationError.prototype);
    }
}
/**
 * Wraps an individual Vercel AI SDK execute function with AgentSentinel policy inspection.
 */
export function wrapVercelExecute(toolName, executeFn, options) {
    if (!options?.engine) {
        throw new Error('[wrapVercelExecute] A valid SentinelEngine instance is required in options.');
    }
    const { engine, category, agentId, errorMode = 'throw', onIntercept, } = options;
    return async (rawParams, executionOptions) => {
        const context = {
            id: executionOptions?.toolCallId || `vercel-ai-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            agentId,
            toolName,
            category,
            params: rawParams || {},
            timestamp: Date.now(),
        };
        const evalResult = await engine.evaluate(context);
        if (onIntercept) {
            await onIntercept(context, evalResult);
        }
        if (!evalResult.allowed || evalResult.verdict === Verdict.BLOCK) {
            const reasons = evalResult.violations.map((v) => v.reason).join(' | ');
            const message = `[AgentSentinel] Blocked tool execution "${toolName}": ${reasons || 'Security policy violation'}`;
            if (errorMode === 'return_error_object') {
                return {
                    error: true,
                    blocked: true,
                    verdict: Verdict.BLOCK,
                    toolName,
                    reason: message,
                    violations: evalResult.violations,
                };
            }
            throw new SentinelPolicyViolationError(message, toolName, evalResult.violations, context);
        }
        // Pass sanitized / redacted params if rule returned Verdict.REDACT
        const sanitizedParams = (evalResult.redactedParams ?? rawParams);
        return executeFn(sanitizedParams, executionOptions);
    };
}
/**
 * Wraps a single Vercel AI SDK CoreTool object with AgentSentinel firewall guard.
 */
export function protectVercelTool(toolName, toolDef, options) {
    if (!toolDef || typeof toolDef !== 'object') {
        return toolDef;
    }
    if (typeof toolDef.execute !== 'function') {
        return toolDef;
    }
    const guardedExecute = wrapVercelExecute(toolName, toolDef.execute, options);
    return {
        ...toolDef,
        execute: guardedExecute,
    };
}
/**
 * Protects an entire dictionary of Vercel AI SDK tools in a single call.
 */
export function protectVercelTools(tools, options) {
    if (!tools || typeof tools !== 'object') {
        return tools;
    }
    const protectedTools = {};
    for (const [name, toolDef] of Object.entries(tools)) {
        protectedTools[name] = protectVercelTool(name, toolDef, options);
    }
    return protectedTools;
}
//# sourceMappingURL=vercel_ai_adapter.js.map