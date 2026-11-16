/**
 * AgentSentinel Vercel AI SDK Integration Adapter.
 * Provides zero-trust runtime policy enforcement and parameter sanitization
 * for Vercel AI SDK `tool()` definitions and `execute()` callbacks.
 */
import { Verdict, ToolCallContext, RuleViolation, EvaluationResult, ToolCategory } from '../types.js';
import { SentinelEngine } from '../index.js';
export interface VercelAiExecutionOptions {
    toolCallId?: string;
    messages?: any[];
    abortSignal?: AbortSignal;
    [key: string]: any;
}
export interface VercelAiCoreTool<TParams = any, TResult = any> {
    description?: string;
    parameters?: any;
    execute?: (params: TParams, options?: VercelAiExecutionOptions) => Promise<TResult>;
    [key: string]: any;
}
export type VercelAiErrorMode = 'throw' | 'return_error_object';
export interface VercelAiAdapterOptions {
    engine: SentinelEngine;
    category?: ToolCategory;
    agentId?: string;
    errorMode?: VercelAiErrorMode;
    onIntercept?: (context: ToolCallContext, result: EvaluationResult) => void | Promise<void>;
}
export declare class SentinelPolicyViolationError extends Error {
    readonly ruleId: string;
    readonly verdict: Verdict;
    readonly violations: RuleViolation[];
    readonly toolName: string;
    readonly toolCallContext: ToolCallContext;
    constructor(message: string, toolName: string, violations: RuleViolation[], context: ToolCallContext);
}
/**
 * Wraps an individual Vercel AI SDK execute function with AgentSentinel policy inspection.
 */
export declare function wrapVercelExecute<TParams extends Record<string, any> = Record<string, any>, TResult = any>(toolName: string, executeFn: (params: TParams, options?: VercelAiExecutionOptions) => Promise<TResult>, options: VercelAiAdapterOptions): (params: TParams, executionOptions?: VercelAiExecutionOptions) => Promise<TResult>;
/**
 * Wraps a single Vercel AI SDK CoreTool object with AgentSentinel firewall guard.
 */
export declare function protectVercelTool<T extends VercelAiCoreTool>(toolName: string, toolDef: T, options: VercelAiAdapterOptions): T;
/**
 * Protects an entire dictionary of Vercel AI SDK tools in a single call.
 */
export declare function protectVercelTools<TRecord extends Record<string, VercelAiCoreTool>>(tools: TRecord, options: VercelAiAdapterOptions): TRecord;
//# sourceMappingURL=vercel_ai_adapter.d.ts.map