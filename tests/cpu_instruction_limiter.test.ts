import { describe, it, expect } from 'vitest';
import { createCpuInstructionLimiterRule } from '../src/web3/cpu_instruction_limiter.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('CpuInstructionBudgetLimiter', () => {
  const rule = createCpuInstructionLimiterRule({ maxCpuInstructions: 10000000 });

  it('allows simulation calls within CPU budget', () => {
    const context: ToolCallContext = {
      id: 'tx_cpu_safe',
      toolName: 'soroban_simulate_transaction',
      params: { cpuInstructions: 5000000 },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).toBeNull();
  });

  it('blocks simulation calls exceeding CPU budget', () => {
    const context: ToolCallContext = {
      id: 'tx_cpu_exceeded',
      toolName: 'soroban_simulate_transaction',
      params: { cpuInstructions: 15000000 },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('CPU_BUDGET_EXCEEDED');
  });
});
