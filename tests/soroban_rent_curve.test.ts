import { describe, it, expect } from 'vitest';
import { createSorobanRentCurveRule } from '../src/web3/soroban_rent_curve.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Soroban Dynamic Rent Fee Curve Prediction Analyzer (#891, #892)', () => {
  const rule = createSorobanRentCurveRule({
    maxAllowedRentStroops: 20_000_000, // 2 XLM
    maxRentSurgeMultiplier: 4.0,
  });

  it('allows normal rent within baseline thresholds', () => {
    const ctx: ToolCallContext = {
      id: 'rent-safe-1',
      toolName: 'soroban_extend_ttl',
      params: {
        storageBytes: 2048, // 2 KB
        extendLedgers: 1000,
      },
      timestamp: Date.now(),
    };

    const violation = rule.evaluate(ctx);
    expect(violation).toBeNull();
  });

  it('blocks rent predictions exceeding absolute maximum ceiling (#892)', () => {
    const ctx: ToolCallContext = {
      id: 'rent-exceeded-1',
      toolName: 'soroban_extend_ttl',
      params: {
        storageBytes: 10240, // 10 KB
        extendLedgers: 50000,
        quotedRentStroops: 25_000_000, // > 20,000,000
      },
      timestamp: Date.now(),
    };

    const violation = rule.evaluate(ctx);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.reason).toContain('exceeds maximum allowed rent ceiling');
  });

  it('blocks rent when dynamic curve surges 5x above baseline', () => {
    const ctx: ToolCallContext = {
      id: 'rent-surge-ratio-1',
      toolName: 'soroban_invoke',
      params: {
        storageBytes: 1024,
        extendLedgers: 1000,
        quotedRentStroops: 550_000, // 5.5x of baseline 100,000
      },
      timestamp: Date.now(),
    };

    const violation = rule.evaluate(ctx);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.reason).toContain('Dynamic rent fee curve surged');
  });
});
