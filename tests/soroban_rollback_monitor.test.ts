import { describe, it, expect } from 'vitest';
import { createSorobanRollbackMonitorRule } from '../src/web3/soroban_rollback_monitor.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Soroban Atomic Batch Rollback Monitor (#915, #916)', () => {
  const rule = createSorobanRollbackMonitorRule();

  it('allows atomic batch invocations', () => {
    const ctx: ToolCallContext = {
      id: 'batch-atomic-ok-1',
      toolName: 'stellar_batch_tx',
      params: {
        atomic: true,
        operations: [{ op: 'transfer' }, { op: 'swap' }],
      },
      timestamp: Date.now(),
    };
    expect(rule.evaluate(ctx)).toBeNull();
  });

  it('blocks non-atomic batches with continueOnError enabled (#916)', () => {
    const ctx: ToolCallContext = {
      id: 'batch-non-atomic-1',
      toolName: 'stellar_batch_tx',
      params: {
        continueOnError: true,
        operations: [{ op: 'transfer' }, { op: 'swap' }],
      },
      timestamp: Date.now(),
    };
    const violation = rule.evaluate(ctx);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.reason).toContain('Non-atomic multi-operation contract batch detected');
  });
});
