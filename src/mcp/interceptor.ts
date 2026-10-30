/**
 * Model Context Protocol (MCP) Tool Call Interceptor Middleware.
 * Standardizes zero-trust runtime policy enforcement, parameter sanitization,
 * and security blocking across MCP client and server communications.
 */

import {
  Verdict,
  ToolCallContext,
  RuleViolation,
  EvaluationResult,
} from '../types.js';
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

export const MCP_ERROR_CODES = {
  POLICY_VIOLATION: -32000,
  CONFIRM_REJECTED: -32001,
  ACCESS_DENIED: -32002,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
} as const;

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

export class McpToolCallInterceptor {
  private engine: SentinelEngine;
  private errorMode: McpErrorMode;
  private blockedMessagePrefix: string;
  private allowTools: Set<string>;
  private denyTools: Set<string>;
  private agentId?: string;
  private onIntercept?: (context: ToolCallContext, result: EvaluationResult) => void | Promise<void>;

  constructor(options: McpInterceptorOptions) {
    if (!options.engine) {
      throw new Error('[McpToolCallInterceptor] A valid SentinelEngine instance must be provided.');
    }
    this.engine = options.engine;
    this.errorMode = options.errorMode ?? 'tool_result_error';
    this.blockedMessagePrefix = options.blockedMessagePrefix ?? '[AgentSentinel MCP Guard] Execution Blocked: ';
    this.allowTools = new Set(options.allowTools ?? []);
    this.denyTools = new Set(options.denyTools ?? []);
    this.agentId = options.agentId;
    this.onIntercept = options.onIntercept;
  }

  /**
   * Intercepts and evaluates an MCP tool call by name and arguments.
   */
  public async interceptToolCall(
    name: string,
    rawArgs: Record<string, any> = {},
    contextOverrides: Partial<ToolCallContext> = {}
  ): Promise<McpInterceptResult> {
    // 1. Explicit Deny Check
    if (this.denyTools.has(name)) {
      const violation: RuleViolation = {
        ruleId: 'mcp-deny-tool',
        ruleName: 'Prohibited MCP Tool Name',
        severity: 'critical',
        verdict: Verdict.BLOCK,
        reason: `MCP tool "${name}" is explicitly prohibited by policy.`,
      };
      return this.buildBlockedResult(name, rawArgs, [violation]);
    }

    // 2. Explicit Allowlist Check
    if (this.allowTools.has(name)) {
      return {
        allowed: true,
        verdict: Verdict.ALLOW,
        sanitizedArgs: rawArgs,
        violations: [],
      };
    }

    // 3. Construct ToolCallContext
    const context: ToolCallContext = {
      id: contextOverrides.id ?? `mcp-call-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      agentId: contextOverrides.agentId ?? this.agentId,
      toolName: name,
      category: contextOverrides.category,
      params: rawArgs,
      timestamp: Date.now(),
      ...contextOverrides,
    };

    // 4. Evaluate through Sentinel Engine
    const evalResult = await this.engine.evaluate(context);

    if (this.onIntercept) {
      await this.onIntercept(context, evalResult);
    }

    if (!evalResult.allowed || evalResult.verdict === Verdict.BLOCK) {
      return this.buildBlockedResult(name, rawArgs, evalResult.violations);
    }

    // Handle REDACT or sanitized parameters
    const sanitizedArgs = evalResult.redactedParams ?? rawArgs;

    return {
      allowed: true,
      verdict: evalResult.verdict,
      sanitizedArgs,
      violations: evalResult.violations,
    };
  }

  /**
   * Formats a blocked evaluation outcome into structured errors.
   */
  private buildBlockedResult(
    toolName: string,
    args: Record<string, any>,
    violations: RuleViolation[]
  ): McpInterceptResult {
    const reasons = violations.map((v) => v.reason).join(' | ');
    const fullMessage = `${this.blockedMessagePrefix}${reasons || 'Blocked by security firewall.'}`;

    const errorResult: McpToolCallResult = {
      isError: true,
      content: [
        {
          type: 'text',
          text: fullMessage,
        },
      ],
    };

    const jsonRpcError = {
      code: MCP_ERROR_CODES.POLICY_VIOLATION,
      message: fullMessage,
      data: {
        verdict: Verdict.BLOCK,
        violations,
        toolName,
      },
    };

    return {
      allowed: false,
      verdict: Verdict.BLOCK,
      sanitizedArgs: args,
      violations,
      errorResult,
      jsonRpcError,
    };
  }

  /**
   * Wraps an MCP tool execution handler with runtime policy enforcement.
   */
  public wrapToolHandler<T = any>(
    toolName: string,
    handler: (args: Record<string, any>) => Promise<T>
  ): (args: Record<string, any>) => Promise<T | McpToolCallResult> {
    return async (args: Record<string, any>): Promise<T | McpToolCallResult> => {
      const decision = await this.interceptToolCall(toolName, args);

      if (!decision.allowed) {
        if (this.errorMode === 'jsonrpc_error') {
          const err = new Error(decision.jsonRpcError?.message || 'Blocked by AgentSentinel MCP Guard');
          (err as any).code = decision.jsonRpcError?.code ?? MCP_ERROR_CODES.POLICY_VIOLATION;
          (err as any).data = decision.jsonRpcError?.data;
          throw err;
        }
        return decision.errorResult!;
      }

      return handler(decision.sanitizedArgs);
    };
  }

  /**
   * Handles an incoming JSON-RPC 2.0 request (e.g. tools/call).
   * If allowed, executes next(sanitizedRequest). If blocked, returns error response.
   */
  public async handleJsonRpc(
    request: McpJsonRpcRequest,
    next: (request: McpJsonRpcRequest) => Promise<any>
  ): Promise<any> {
    const requestId = request.id ?? null;

    if (request.method === 'tools/call' && request.params?.name) {
      const toolName = request.params.name;
      const toolArgs = request.params.arguments ?? {};

      const decision = await this.interceptToolCall(toolName, toolArgs);

      if (!decision.allowed) {
        if (this.errorMode === 'jsonrpc_error') {
          const errorResp: McpJsonRpcErrorResponse = {
            jsonrpc: '2.0',
            id: requestId,
            error: decision.jsonRpcError!,
          };
          return errorResp;
        }

        const successResp: McpJsonRpcSuccessResponse = {
          jsonrpc: '2.0',
          id: requestId ?? '0',
          result: decision.errorResult,
        };
        return successResp;
      }

      // Mutate request params with sanitized / redacted args
      const sanitizedRequest: McpJsonRpcRequest = {
        ...request,
        params: {
          ...request.params,
          arguments: decision.sanitizedArgs,
        },
      };

      return next(sanitizedRequest);
    }

    // Other non-tool MCP methods (e.g., resources/list, prompts/get, ping) pass through
    return next(request);
  }
}

/**
 * Convenience helper to instantiate an McpToolCallInterceptor.
 */
export function createMcpInterceptor(
  engine: SentinelEngine,
  options?: Omit<McpInterceptorOptions, 'engine'>
): McpToolCallInterceptor {
  return new McpToolCallInterceptor({
    engine,
    ...options,
  });
}
