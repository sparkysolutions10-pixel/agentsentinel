import { describe, it, expect } from 'vitest';
import { createSorobanOracleTripwireRule } from '../src/web3/soroban_oracle_tripwire.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Soroban Price Oracle Tripwire (#923, #924)', () => {
  const rule = createSorobanOracleTripwireRule({
    maxStalenessSeconds: 300,
    maxDeviationPercent: 3.0,
  });

  it('allows fresh oracle feed with consistent prices', () => {
    const nowSec = Math.floor(Date.now() / 1000);
    const ctx: ToolCallContext = {
      id: 'oracle-ok-1',
      toolName: 'soroban_oracle_query',
      params: {
        oracleTimestamp: nowSec - 50,
        oraclePrice: 100.5,
        secondaryPrice: 100.2, // ~0.3% deviation
      },
      timestamp: Date.now(),
    };
    expect(rule.evaluate(ctx)).toBeNull();
  });

  it('blocks stale oracle data older than 300 seconds (#924)', () => {
    const nowSec = Math.floor(Date.now() / 1000);
    const ctx: ToolCallContext = {
      id: 'oracle-stale-1',
      toolName: 'soroban_oracle_query',
      params: {
        oracleTimestamp: nowSec - 800, // 800s > 300s
      },
      timestamp: Date.now(),
    };
    const violation = rule.evaluate(ctx);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.reason).toContain('Price oracle quote is stale');
  });

  it('blocks manipulated oracle quotes deviating > 3% from benchmark', () => {
    const nowSec = Math.floor(Date.now() / 1000);
    const ctx: ToolCallContext = {
      id: 'oracle-deviated-1',
      toolName: 'soroban_oracle_query',
      params: {
        oracleTimestamp: nowSec - 10,
        oraclePrice: 115.0,
        secondaryPrice: 100.0, // 15% deviation > 3%
      },
      timestamp: Date.now(),
    };
    const violation = rule.evaluate(ctx);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.reason).toContain('Oracle price deviation');
  });
});
