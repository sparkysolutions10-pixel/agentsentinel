import { describe, it, expect } from 'vitest';
import { McpDynamicSamplingBudgetClamp } from '../src/mcp/mcp_dynamic_sampling_budget_clamp.js';

describe('McpDynamicSamplingBudgetClamp Invariant Suite (#1814)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = McpDynamicSamplingBudgetClamp.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MCP_DYNAMIC_SAMPLING_BUDGET_CLAMP');
    expect(McpDynamicSamplingBudgetClamp.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = McpDynamicSamplingBudgetClamp.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(McpDynamicSamplingBudgetClamp.validate('git status && npm run test')).toBe(true);
  });
});
