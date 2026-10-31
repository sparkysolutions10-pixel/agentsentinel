/**
 * AgentSentinel - Soroban CPU Instruction Budget Limiter
 * Enforces maximum CPU instruction thresholds on contract simulations
 * to avoid out-of-gas failures and unoptimized compute expenditures.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface CpuInstructionConfig {
  maxCpuInstructions?: number; // default: 25,000,000 instructions
}

export function createCpuInstructionLimiterRule(config: CpuInstructionConfig = {}): SentinelRule {
  const maxCpu = config.maxCpuInstructions ?? 25000000;

  return {
    id: 'cpu-instruction-budget-limiter',
    name: 'Soroban CPU Instruction Budget Limiter',
    category: 'custom' as ToolCategory,
    priority: 85,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('soroban') && !tool.includes('simulate') && !tool.includes('invoke')) {
        return null;
      }

      const params = context.params || {};
      const cpu = Number(params.cpuInstructions ?? params.instructions ?? params.cpu ?? 0);

      if (cpu > maxCpu) {
        return {
          ruleId: 'cpu-instruction-budget-limiter',
          ruleName: 'Soroban CPU Instruction Budget Limiter',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: `Simulation CPU instructions (${cpu.toLocaleString()}) exceed safety ceiling (${maxCpu.toLocaleString()}). Execution aborted to prevent resource exhaustion.`,
          detectedPattern: `CPU_BUDGET_EXCEEDED:${cpu}>${maxCpu}`
        };
      }

      return null;
    }
  };
}
