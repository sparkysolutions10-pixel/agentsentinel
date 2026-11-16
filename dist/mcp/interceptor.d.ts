/**
 * Model Context Protocol (MCP) Tool Call Interceptor Middleware.
 * Standardizes zero-trust runtime policy enforcement, parameter sanitization,
 * and security blocking across MCP client and server communications.
 */
import { Verdict, ToolCallContext, RuleViolation, EvaluationResult } from '../types.js';
import { SentinelEngine } from '../index.js';
export interface McpContentItem {
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
    uri?: string;
}
export interface McpToolCallResult {
    content: McpContentItem[];
    isError?: boolean;
}
export interface McpJsonRpcRequest {
    jsonrpc: '2.0';
    id?: string | number;
    method: string;
    params?: {
        name?: string;
        arguments?: Record<string, any>;
        [key: string]: any;
    };
}
export interface McpJsonRpcSuccessResponse {
    jsonrpc: '2.0';
    id: string | number;
    result: McpToolCallResult | any;
}
export interface McpJsonRpcErrorResponse {
    jsonrpc: '2.0';
    id: string | number | null;
    error: {
        code: number;
        message: string;
        data?: {
            verdict: Verdict;
            violations: RuleViolation[];
            toolName: string;
            [key: string]: any;
        };
    };
}
export declare const MCP_ERROR_CODES: {
    readonly POLICY_VIOLATION: -32000;
    readonly CONFIRM_REJECTED: -32001;
    readonly ACCESS_DENIED: -32002;
    readonly INVALID_PARAMS: -32602;
    readonly INTERNAL_ERROR: -32603;
};
export type McpErrorMode = 'jsonrpc_error' | 'tool_result_error';
export interface McpInterceptorOptions {
    engine: SentinelEngine;
    errorMode?: McpErrorMode;
    blockedMessagePrefix?: string;
    allowTools?: string[];
    denyTools?: string[];
    agentId?: string;
    onIntercept?: (context: ToolCallContext, result: EvaluationResult) => void | Promise<void>;
}
export interface McpInterceptResult {
    allowed: boolean;
    verdict: Verdict;
    sanitizedArgs: Record<string, any>;
    violations: RuleViolation[];
    errorResult?: McpToolCallResult;
    jsonRpcError?: McpJsonRpcErrorResponse['error'];
}
export declare class McpToolCallInterceptor {
    private engine;
    private errorMode;
    private blockedMessagePrefix;
    private allowTools;
    private denyTools;
    private agentId?;
    private onIntercept?;
    constructor(options: McpInterceptorOptions);
    /**
     * Intercepts and evaluates an MCP tool call by name and arguments.
     */
    interceptToolCall(name: string, rawArgs?: Record<string, any>, contextOverrides?: Partial<ToolCallContext>): Promise<McpInterceptResult>;
    /**
     * Formats a blocked evaluation outcome into structured errors.
     */
    private buildBlockedResult;
    /**
     * Wraps an MCP tool execution handler with runtime policy enforcement.
     */
    wrapToolHandler<T = any>(toolName: string, handler: (args: Record<string, any>) => Promise<T>): (args: Record<string, any>) => Promise<T | McpToolCallResult>;
    /**
     * Handles an incoming JSON-RPC 2.0 request (e.g. tools/call).
     * If allowed, executes next(sanitizedRequest). If blocked, returns error response.
     */
    handleJsonRpc(request: McpJsonRpcRequest, next: (request: McpJsonRpcRequest) => Promise<any>): Promise<any>;
}
/**
 * Convenience helper to instantiate an McpToolCallInterceptor.
 */
export declare function createMcpInterceptor(engine: SentinelEngine, options?: Omit<McpInterceptorOptions, 'engine'>): McpToolCallInterceptor;
//# sourceMappingURL=interceptor.d.ts.map