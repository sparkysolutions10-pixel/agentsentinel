import { describe, it, expect, vi } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import { Verdict, SentinelRule, ToolCallContext } from '../src/types.js';

describe('SentinelEngine - Dry-Run Non-Blocking Audit Mode (Issue #24)', () => {
  const dummyContext: ToolCallContext = {
    id: 'call-dryrun-01',
    toolName: 'shell:exec',
    category: 'shell',
    params: { cmd: 'rm -rf /' },
    timestamp: Date.now(),
  };

  const blockRootRule: SentinelRule = {
    id: 'block-rm-root',
    name: 'Block Root Deletion',
    category: 'shell',
    priority: 100,
    enabled: true,
    evaluate: (ctx) => {
      if (ctx.params?.cmd?.includes('rm -rf /')) {
        return {
          ruleId: 'block-rm-root',
          ruleName: 'Block Root Deletion',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: 'Attempted deletion of root filesystem',
        };
      }
      return null;
    },
  };

  it('allows tool execution while recording violations when dryRun: true is set on engine', async () => {
    const violationSpy = vi.fn();
    const engine = new SentinelEngine(undefined, undefined, undefined, { dryRun: true });
    engine.registerRule(blockRootRule);
    engine.onViolation(violationSpy);

    const result = await engine.evaluate(dummyContext);

    // Assert non-blocking execution
    expect(result.allowed).toBe(true);
    expect(result.verdict).toBe(Verdict.ALLOW);
    expect(result.dryRun).toBe(true);
    expect(result.simulatedVerdict).toBe(Verdict.BLOCK);

    // Assert violations are recorded
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].ruleId).toBe('block-rm-root');
    expect(violationSpy).toHaveBeenCalledTimes(1);

    // Assert audit log was recorded
    const logs = engine.logger.getRecentEvents();
    expect(logs).toHaveLength(1);
    expect(logs[0].ruleId).toBe('block-rm-root');
    expect(logs[0].verdict).toBe(Verdict.BLOCK);
  });

  it('supports per-call dryRun override in evaluate options', async () => {
    const engine = new SentinelEngine(); // default dryRun is false
    engine.registerRule(blockRootRule);

    // Call 1: Without dryRun -> BLOCKED
    const blockedResult = await engine.evaluate(dummyContext);
    expect(blockedResult.allowed).toBe(false);
    expect(blockedResult.verdict).toBe(Verdict.BLOCK);
    expect(blockedResult.dryRun).toBe(false);

    // Call 2: With per-call dryRun: true -> ALLOWED
    const dryRunResult = await engine.evaluate(dummyContext, { dryRun: true });
    expect(dryRunResult.allowed).toBe(true);
    expect(dryRunResult.verdict).toBe(Verdict.ALLOW);
    expect(dryRunResult.dryRun).toBe(true);
    expect(dryRunResult.simulatedVerdict).toBe(Verdict.BLOCK);
    expect(dryRunResult.violations).toHaveLength(1);
  });

  it('toggles dryRun dynamically via setDryRun', async () => {
    const engine = new SentinelEngine();
    engine.registerRule(blockRootRule);

    // 1. Initial state (enforcing)
    expect(engine.dryRun).toBe(false);
    let res = await engine.evaluate(dummyContext);
    expect(res.allowed).toBe(false);

    // 2. Enable dry-run
    engine.setDryRun(true);
    expect(engine.dryRun).toBe(true);
    res = await engine.evaluate(dummyContext);
    expect(res.allowed).toBe(true);
    expect(res.dryRun).toBe(true);

    // 3. Disable dry-run
    engine.setDryRun(false);
    expect(engine.dryRun).toBe(false);
    res = await engine.evaluate(dummyContext);
    expect(res.allowed).toBe(false);
    expect(res.dryRun).toBe(false);
  });

  it('evaluates all rules without early exit in dry-run mode for comprehensive telemetry', async () => {
    const engine = new SentinelEngine(undefined, undefined, undefined, { dryRun: true });

    const rule1: SentinelRule = {
      id: 'rule-block-1',
      name: 'Rule 1',
      category: 'shell',
      priority: 200,
      enabled: true,
      evaluate: () => ({
        ruleId: 'rule-block-1',
        ruleName: 'Rule 1',
        severity: 'high',
        verdict: Verdict.BLOCK,
        reason: 'Block 1',
      }),
    };

    const rule2: SentinelRule = {
      id: 'rule-block-2',
      name: 'Rule 2',
      category: 'shell',
      priority: 100,
      enabled: true,
      evaluate: () => ({
        ruleId: 'rule-block-2',
        ruleName: 'Rule 2',
        severity: 'medium',
        verdict: Verdict.BLOCK,
        reason: 'Block 2',
      }),
    };

    engine.registerRule(rule1);
    engine.registerRule(rule2);

    const result = await engine.evaluate(dummyContext);
    expect(result.allowed).toBe(true);
    // In dry-run mode, both rules are evaluated so full telemetry is gathered
    expect(result.violations).toHaveLength(2);
    expect(result.violations.map((v) => v.ruleId)).toEqual(['rule-block-1', 'rule-block-2']);
  });
});
