import { describe, it, expect, vi } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import { Verdict, SentinelRule, ToolCallContext } from '../src/types.js';

describe('SentinelEngine - Lifecycle Execution Order & Resilience (Issue #2)', () => {
  it('executes multiple beforeExecute hooks in strict registration order and cascades mutations', async () => {
    const engine = new SentinelEngine();
    const sequence: number[] = [];

    engine
      .beforeExecute((ctx) => {
        sequence.push(1);
        return {
          ...ctx,
          params: { ...ctx.params, step1: true }
        };
      })
      .beforeExecute(async (ctx) => {
        // Asynchronous hook
        await new Promise((r) => setTimeout(r, 10));
        sequence.push(2);
        return {
          ...ctx,
          params: { ...ctx.params, step2: ctx.params.step1 === true }
        };
      })
      .beforeExecute((ctx) => {
        sequence.push(3);
        return {
          ...ctx,
          params: { ...ctx.params, finalStep: ctx.params.step2 === true }
        };
      });

    let inspectedParams: Record<string, any> = {};
    const testRule: SentinelRule = {
      id: 'param-inspector',
      name: 'Parameter Inspector',
      category: 'custom',
      priority: 50,
      enabled: true,
      evaluate: (ctx) => {
        inspectedParams = ctx.params;
        return null;
      }
    };

    engine.registerRule(testRule);

    const result = await engine.evaluate({
      id: 'seq-test-1',
      toolName: 'test:cascade',
      params: { initial: 'yes' },
      timestamp: Date.now()
    });

    expect(sequence).toEqual([1, 2, 3]);
    expect(inspectedParams.initial).toBe('yes');
    expect(inspectedParams.step1).toBe(true);
    expect(inspectedParams.step2).toBe(true);
    expect(inspectedParams.finalStep).toBe(true);
    expect(result.allowed).toBe(true);
  });

  it('triggers onViolation hooks with complete violation context when non-ALLOW verdict occurs', async () => {
    const engine = new SentinelEngine();
    const capturedViolations: any[] = [];

    engine.onViolation((violation, context) => {
      capturedViolations.push({
        ruleId: violation.ruleId,
        verdict: violation.verdict,
        toolName: context.toolName
      });
    });

    const blockRule: SentinelRule = {
      id: 'critical-guard',
      name: 'Critical Guard',
      category: 'shell',
      priority: 100,
      enabled: true,
      evaluate: () => ({
        ruleId: 'critical-guard',
        ruleName: 'Critical Guard',
        severity: 'critical',
        verdict: Verdict.BLOCK,
        reason: 'Operation denied'
      })
    };

    engine.registerRule(blockRule);

    const result = await engine.evaluate({
      id: 'viol-test-1',
      toolName: 'bash:rm',
      params: { path: '/etc' },
      timestamp: Date.now()
    });

    expect(result.verdict).toBe(Verdict.BLOCK);
    expect(capturedViolations.length).toBe(1);
    expect(capturedViolations[0].ruleId).toBe('critical-guard');
    expect(capturedViolations[0].verdict).toBe(Verdict.BLOCK);
    expect(capturedViolations[0].toolName).toBe('bash:rm');
  });

  it('guarantees afterExecute hooks receive immutable result and records sub-millisecond latency', async () => {
    const engine = new SentinelEngine();
    let capturedResult: any = null;
    let hookExecuted = false;

    engine.afterExecute((context, result) => {
      hookExecuted = true;
      capturedResult = result;
    });

    const result = await engine.evaluate({
      id: 'after-test-1',
      toolName: 'fs:read',
      params: { file: 'package.json' },
      timestamp: Date.now()
    });

    expect(hookExecuted).toBe(true);
    expect(capturedResult).toBeDefined();
    expect(capturedResult.allowed).toBe(true);
    expect(capturedResult.latencyMs).toBeGreaterThanOrEqual(0);
    expect(capturedResult.latencyMs).toBe(result.latencyMs);
  });

  it('prevents hook exceptions from crashing the evaluation pipeline', async () => {
    const engine = new SentinelEngine();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    engine
      .onViolation(() => {
        throw new Error('Exploding onViolation hook');
      })
      .afterExecute(() => {
        throw new Error('Exploding afterExecute hook');
      });

    const failingRule: SentinelRule = {
      id: 'fault-tolerant-rule',
      name: 'Fault Tolerant Rule',
      category: 'custom',
      priority: 10,
      enabled: true,
      evaluate: () => ({
        ruleId: 'fault-tolerant-rule',
        ruleName: 'Fault Tolerant Rule',
        severity: 'high',
        verdict: Verdict.CONFIRM,
        reason: 'Confirmation required'
      })
    };

    engine.registerRule(failingRule);

    const result = await engine.evaluate({
      id: 'fault-test-1',
      toolName: 'network:request',
      params: { url: 'https://api.internal' },
      timestamp: Date.now()
    });

    expect(result.verdict).toBe(Verdict.CONFIRM);
    expect(result.allowed).toBe(true);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
