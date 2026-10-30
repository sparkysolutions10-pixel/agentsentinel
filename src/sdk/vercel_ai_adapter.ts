/**
 * AgentSentinel Vercel AI SDK Integration Adapter.
 * Provides zero-trust runtime policy enforcement and parameter sanitization
 * for Vercel AI SDK `tool()` definitions and `execute()` callbacks.
 */

import {
  Verdict,
  ToolCallContext,
  RuleViolation,
  EvaluationResult,
  ToolCategory,
} from '../types.js';
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

export class SentinelPolicyViolationError extends Error {
  public readonly ruleId: string;
  public readonly verdict: Verdict;
  public readonly violations: RuleViolation[];
  public readonly toolName: string;
  public readonly toolCallContext: ToolCallContext;

  constructor(
    message: string,
    toolName: string,
    violations: RuleViolation[],
    context: ToolCallContext
  ) {
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
export function wrapVercelExecute<TParams extends Record<string, any> = Record<string, any>, TResult = any>(
  toolName: string,
  executeFn: (params: TParams, options?: VercelAiExecutionOptions) => Promise<TResult>,
  options: VercelAiAdapterOptions
): (params: TParams, executionOptions?: VercelAiExecutionOptions) => Promise<TResult> {
  if (!options?.engine) {
    throw new Error('[wrapVercelExecute] A valid SentinelEngine instance is required in options.');
  }

  const {
    engine,
    category,
    agentId,
    errorMode = 'throw',
    onIntercept,
  } = options;

  return async (rawParams: TParams, executionOptions?: VercelAiExecutionOptions): Promise<TResult> => {
    const context: ToolCallContext = {
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
        } as unknown as TResult;
      }

      throw new SentinelPolicyViolationError(message, toolName, evalResult.violations, context);
    }

    // Pass sanitized / redacted params if rule returned Verdict.REDACT
    const sanitizedParams = (evalResult.redactedParams ?? rawParams) as TParams;
    return executeFn(sanitizedParams, executionOptions);
  };
}

/**
 * Wraps a single Vercel AI SDK CoreTool object with AgentSentinel firewall guard.
 */
export function protectVercelTool<T extends VercelAiCoreTool>(
  toolName: string,
  toolDef: T,
  options: VercelAiAdapterOptions
): T {
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
export function protectVercelTools<TRecord extends Record<string, VercelAiCoreTool>>(
  tools: TRecord,
  options: VercelAiAdapterOptions
): TRecord {
  if (!tools || typeof tools !== 'object') {
    return tools;
  }

  const protectedTools: Record<string, VercelAiCoreTool> = {};

  for (const [name, toolDef] of Object.entries(tools)) {
    protectedTools[name] = protectVercelTool(name, toolDef, options);
  }

  return protectedTools as TRecord;
}
