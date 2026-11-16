/**
 * AgentSentinel LangChain Integration Adapter.
 * Enforces zero-trust runtime security policies, parameter sanitization, and blocking
 * across LangChain StructuredTool, DynamicStructuredTool, and BaseTool instances.
 */
import { Verdict, ToolCallContext, RuleViolation, EvaluationResult, ToolCategory } from '../types.js';
import { SentinelEngine } from '../index.js';
export interface LangChainToolLike<TInput = any, TOutput = any> {
    name: string;
    description: string;
    schema?: any;
    invoke?: (input: TInput, config?: any) => Promise<TOutput>;
    call?: (input: TInput, runManager?: any) => Promise<TOutput>;
    _call?: (input: TInput, runManager?: any) => Promise<TOutput>;
    [key: string]: any;
}
export interface LangChainAdapterOptions {
    engine: SentinelEngine;
    category?: ToolCategory;
    agentId?: string;
    returnDirectOnError?: boolean;
    onIntercept?: (context: ToolCallContext, result: EvaluationResult) => void | Promise<void>;
}
export declare class LangChainPolicyException extends Error {
    readonly ruleId: string;
    readonly verdict: Verdict;
    readonly violations: RuleViolation[];
    readonly toolName: string;
    readonly toolCallContext: ToolCallContext;
    constructor(message: string, toolName: string, violations: RuleViolation[], context: ToolCallContext);
}
/**
 * Wraps a LangChain StructuredTool instance with AgentSentinel runtime policy enforcement.
 */
export declare function wrapLangChainTool<T extends LangChainToolLike>(tool: T, options: LangChainAdapterOptions): T;
/**
 * Protects an array of LangChain tools in a single call.
 */
export declare function protectLangChainTools<T extends LangChainToolLike>(tools: T[], options: LangChainAdapterOptions): T[];
/**
 * Base SentinelStructuredTool class compatible with LangChain StructuredTool interfaces.
 */
export declare class SentinelStructuredTool<TInput = any, TOutput = any> implements LangChainToolLike<TInput, TOutput> {
    name: string;
    description: string;
    schema?: any;
    protected executor: (input: TInput) => Promise<TOutput>;
    constructor(name: string, description: string, executor: (input: TInput) => Promise<TOutput>, options: LangChainAdapterOptions, schema?: any);
    _call(input: TInput): Promise<TOutput>;
    invoke(input: TInput): Promise<TOutput>;
    call(input: TInput): Promise<TOutput>;
}
//# sourceMappingURL=langchain_adapter.d.ts.map