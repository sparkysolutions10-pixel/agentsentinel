/**
 * AgentSentinel - Stellar MCP (Model Context Protocol) Tool Call Wrapper
 * Intercepts Model Context Protocol (MCP) tool executions directed towards
 * Stellar Horizon and Soroban RPC tools to guard against prompt injection exploits.
 */

import { SentinelEngine } from '../index.js';
import { ToolCallContext, EvaluationResult, Verdict } from '../types.js';

export interface StellarMcpWrapperConfig {
  engine: SentinelEngine;
}

export class StellarMcpSecurityWrapper {
  private engine: SentinelEngine;

  constructor(config: StellarMcpWrapperConfig) {
    this.engine = config.engine;
  }

  public async wrapToolExecution<T>(
    toolName: string,
    toolArgs: Record<string, any>,
    executor: (args: Record<string, any>) => Promise<T>
  ): Promise<{ result?: T; evaluation: EvaluationResult }> {
    const context: ToolCallContext = {
      id: `mcp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      toolName,
      params: toolArgs,
      timestamp: Date.now()
    };

    const evaluation = await this.engine.evaluate(context);

    if (evaluation.verdict === Verdict.BLOCK || !evaluation.allowed) {
      throw new Error(`[AgentSentinel MCP Guard] Tool "${toolName}" blocked: ${evaluation.violations.map(v => v.reason).join(' | ')}`);
    }

    const finalArgs = evaluation.redactedParams || toolArgs;
    const result = await executor(finalArgs);
    return { result, evaluation };
  }
}
