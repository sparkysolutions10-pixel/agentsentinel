import { describe, it, expect } from 'vitest';
import { createCyclicToolGuardRule } from '../src/web3/cyclic_tool_guard.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('CyclicToolDependencyGuard', () => {
  const rule = createCyclicToolGuardRule({ maxCallChainDepth: 5 });

  it('allows safe acyclic tool call chains', () => {
    const context: ToolCallContext = {
      id: 'tx_call_1',
      toolName: 'finalize_settlement',
      params: { _callStack: ['fetch_order', 'check_liquidity'] },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).toBeNull();
  });

  it('detects and blocks cyclic tool invocation loop (A -> B -> A)', () => {
    const context: ToolCallContext = {
      id: 'tx_call_loop',
      toolName: 'fetch_order',
      params: { _callStack: ['fetch_order', 'check_liquidity'] },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('CYCLIC_CALL_DETECTED');
  });

  it('blocks when maximum call depth is exceeded', () => {
    const context: ToolCallContext = {
      id: 'tx_call_deep',
      toolName: 'step_6',
      params: { _callStack: ['step_1', 'step_2', 'step_3', 'step_4', 'step_5'] },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('MAX_DEPTH_EXCEEDED:5>=5');
  });
});
