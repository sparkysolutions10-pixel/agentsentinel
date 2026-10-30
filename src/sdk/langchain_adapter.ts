/**
 * AgentSentinel LangChain Integration Adapter.
 * Enforces zero-trust runtime security policies, parameter sanitization, and blocking
 * across LangChain StructuredTool, DynamicStructuredTool, and BaseTool instances.
 */

import {
  Verdict,
  ToolCallContext,
  RuleViolation,
  EvaluationResult,
  ToolCategory,
} from '../types.js';
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

export class LangChainPolicyException extends Error {
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
    this.name = 'LangChainPolicyException';
    this.toolName = toolName;
    this.violations = violations;
    this.verdict = violations[0]?.verdict ?? Verdict.BLOCK;
    this.ruleId = violations[0]?.ruleId ?? 'policy-violation';
    this.toolCallContext = context;
    Object.setPrototypeOf(this, LangChainPolicyException.prototype);
  }
}

/**
 * Normalizes LangChain tool inputs (which may be a string, null, or key-value object)
 * into a standard Record<string, any> dictionary for policy evaluation.
 */
function normalizeInputToParams(input: unknown): Record<string, any> {
  if (input === null || input === undefined) {
    return {};
  }
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
    } catch {
      // Input is a raw scalar string
      return { input };
    }
    return { input };
  }
  if (typeof input === 'object') {
    return input as Record<string, any>;
  }
  return { input };
}

/**
 * Wraps a LangChain StructuredTool instance with AgentSentinel runtime policy enforcement.
 */
export function wrapLangChainTool<T extends LangChainToolLike>(
  tool: T,
  options: LangChainAdapterOptions
): T {
  if (!options?.engine) {
    throw new Error('[wrapLangChainTool] A valid SentinelEngine instance is required in options.');
  }

  const {
    engine,
    category,
    agentId,
    returnDirectOnError = false,
    onIntercept,
  } = options;

  const originalInvoke = tool.invoke ? tool.invoke.bind(tool) : undefined;
  const originalCall = tool.call ? tool.call.bind(tool) : undefined;
  const originalInternalCall = tool._call ? tool._call.bind(tool) : undefined;

  const evaluateAndSanitize = async (rawInput: any): Promise<{
    allowed: boolean;
    sanitizedInput: any;
    errorMessage?: string;
  }> => {
    const params = normalizeInputToParams(rawInput);
    const context: ToolCallContext = {
      id: `langchain-tool-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      agentId,
      toolName: tool.name,
      category,
      params,
      timestamp: Date.now(),
    };

    const evalResult = await engine.evaluate(context);

    if (onIntercept) {
      await onIntercept(context, evalResult);
    }

    if (!evalResult.allowed || evalResult.verdict === Verdict.BLOCK) {
      const reasons = evalResult.violations.map((v) => v.reason).join(' | ');
      const message = `[AgentSentinel LangChain Policy] Blocked execution of tool "${tool.name}": ${reasons || 'Security rule violation'}`;

      if (returnDirectOnError) {
        return {
          allowed: false,
          sanitizedInput: rawInput,
          errorMessage: message,
        };
      }

      throw new LangChainPolicyException(message, tool.name, evalResult.violations, context);
    }

    // Handle REDACT
    let sanitized = rawInput;
    if (evalResult.redactedParams) {
      if (typeof rawInput === 'object' && rawInput !== null) {
        sanitized = evalResult.redactedParams;
      } else if (typeof rawInput === 'string' && evalResult.redactedParams.input !== undefined) {
        sanitized = evalResult.redactedParams.input;
      }
    }

    return {
      allowed: true,
      sanitizedInput: sanitized,
    };
  };

  // Wrap invoke
  if (originalInvoke) {
    tool.invoke = (async (input: any, config?: any): Promise<any> => {
      const check = await evaluateAndSanitize(input);
      if (!check.allowed) {
        return check.errorMessage;
      }
      return originalInvoke(check.sanitizedInput, config);
    }) as any;
  }

  // Wrap call
  if (originalCall) {
    tool.call = (async (input: any, runManager?: any): Promise<any> => {
      const check = await evaluateAndSanitize(input);
      if (!check.allowed) {
        return check.errorMessage;
      }
      return originalCall(check.sanitizedInput, runManager);
    }) as any;
  }

  // Wrap _call
  if (originalInternalCall) {
    tool._call = (async (input: any, runManager?: any): Promise<any> => {
      const check = await evaluateAndSanitize(input);
      if (!check.allowed) {
        return check.errorMessage;
      }
      return originalInternalCall(check.sanitizedInput, runManager);
    }) as any;
  }

  return tool;
}

/**
 * Protects an array of LangChain tools in a single call.
 */
export function protectLangChainTools<T extends LangChainToolLike>(
  tools: T[],
  options: LangChainAdapterOptions
): T[] {
  if (!Array.isArray(tools)) {
    return tools;
  }
  return tools.map((t) => wrapLangChainTool(t, options));
}

/**
 * Base SentinelStructuredTool class compatible with LangChain StructuredTool interfaces.
 */
export class SentinelStructuredTool<TInput = any, TOutput = any> implements LangChainToolLike<TInput, TOutput> {
  public name: string;
  public description: string;
  public schema?: any;
  protected executor: (input: TInput) => Promise<TOutput>;

  constructor(
    name: string,
    description: string,
    executor: (input: TInput) => Promise<TOutput>,
    options: LangChainAdapterOptions,
    schema?: any
  ) {
    this.name = name;
    this.description = description;
    this.executor = executor;
    this.schema = schema;

    // Wrap this instance with Sentinel protection
    wrapLangChainTool(this, options);
  }

  public async _call(input: TInput): Promise<TOutput> {
    return this.executor(input);
  }

  public async invoke(input: TInput): Promise<TOutput> {
    return this._call(input);
  }

  public async call(input: TInput): Promise<TOutput> {
    return this._call(input);
  }
}
