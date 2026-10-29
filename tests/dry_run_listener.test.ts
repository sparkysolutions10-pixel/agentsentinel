import { describe, it, expect, vi } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import { Verdict, SentinelRule, ToolCallContext, RuleViolation } from '../src/types.js';
import { ConfirmationBridge } from '../src/confirm.js';

describe('SentinelEngine - Dry-Run Listener & Emission Verification (Issue #25)', () => {
  const destructiveContext: ToolCallContext = {
    id: 'call-dryrun-emit-01',
    agentId: 'agent-audit-bot',
    toolName: 'shell:execute',
    category: 'shell',
    params: { cmd: 'mkfs.ext4 /dev/sda1' },
    timestamp: Date.now(),
  };

  const criticalFormatRule: SentinelRule = {
    id: 'block-format-disk',
    name: 'Block Disk Formatting',
    category: 'shell',
    priority: 500,
    enabled: true,
    evaluate: (ctx) => {
      if (ctx.params?.cmd?.includes('mkfs')) {
        return {
          ruleId: 'block-format-disk',
          ruleName: 'Block Disk Formatting',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: 'Direct disk filesystem formatting is prohibited',
          detectedPattern: 'mkfs',
        };
      }
      return null;
    },
  };

  it('asserts that dryRun: true returns ALLOW verdict while emitting violation events to listener', async () => {
    const emittedViolations: RuleViolation[] = [];
    const emittedContexts: ToolCallContext[] = [];

    const engine = new SentinelEngine(undefined, undefined, undefined, { dryRun: true });
    engine.registerRule(criticalFormatRule);

    // Register onViolation hook listener
    engine.onViolation((violation, context) => {
      emittedViolations.push(violation);
      emittedContexts.push(context);
    });

    const result = await engine.evaluate(destructiveContext);

    // 1. Tool execution allowed in dry-run mode
    expect(result.allowed).toBe(true);
    expect(result.verdict).toBe(Verdict.ALLOW);
    expect(result.dryRun).toBe(true);
    expect(result.simulatedVerdict).toBe(Verdict.BLOCK);

    // 2. onViolation listener received the violation
    expect(emittedViolations).toHaveLength(1);
    expect(emittedViolations[0].ruleId).toBe('block-format-disk');
    expect(emittedViolations[0].detectedPattern).toBe('mkfs');
    expect(emittedViolations[0].verdict).toBe(Verdict.BLOCK);

    // 3. Context preserved accurately
    expect(emittedContexts).toHaveLength(1);
    expect(emittedContexts[0].id).toBe('call-dryrun-emit-01');
    expect(emittedContexts[0].params.cmd).toBe('mkfs.ext4 /dev/sda1');
  });

  it('delivers formatted audit records to custom logger sink in dry-run mode', async () => {
    const capturedSinks: { event: any; rawJson: string }[] = [];

    const engine = new SentinelEngine((event, rawJson) => {
      capturedSinks.push({ event, rawJson });
    });
    engine.registerRule(criticalFormatRule);

    const result = await engine.evaluate(destructiveContext, { dryRun: true });

    expect(result.allowed).toBe(true);
    expect(capturedSinks).toHaveLength(1);
    expect(capturedSinks[0].event.ruleId).toBe('block-format-disk');
    expect(capturedSinks[0].event.verdict).toBe(Verdict.BLOCK);
    expect(capturedSinks[0].rawJson).toContain('"ruleId":"block-format-disk"');
  });

  it('skips confirmation bridge pauses in dry-run mode and marks simulated CONFIRM', async () => {
    const bridge = new ConfirmationBridge({ defaultTimeoutMs: 5000 });
    const bridgeRequestSpy = vi.fn();
    bridge.onRequest(bridgeRequestSpy);

    const engine = new SentinelEngine();
    engine.setConfirmationBridge(bridge);

    const confirmRule: SentinelRule = {
      id: 'confirm-reboot',
      name: 'Confirm System Reboot',
      category: 'shell',
      priority: 100,
      enabled: true,
      evaluate: () => ({
        ruleId: 'confirm-reboot',
        ruleName: 'Confirm System Reboot',
        severity: 'high',
        verdict: Verdict.CONFIRM,
        reason: 'Reboot confirmation required',
      }),
    };
    engine.registerRule(confirmRule);

    const result = await engine.evaluate(
      {
        id: 'call-reboot',
        toolName: 'shell:exec',
        category: 'shell',
        params: { cmd: 'reboot' },
        timestamp: Date.now(),
      },
      { dryRun: true }
    );

    // Tool execution allowed immediately without waiting for human confirmation
    expect(result.allowed).toBe(true);
    expect(result.verdict).toBe(Verdict.ALLOW);
    expect(result.dryRun).toBe(true);
    expect(result.simulatedVerdict).toBe(Verdict.CONFIRM);
    expect(bridgeRequestSpy).not.toHaveBeenCalled();
    expect(bridge.pendingCount).toBe(0);
  });

  it('passes dryRun telemetry to afterExecute hook', async () => {
    let capturedTelemetry: any = null;

    const engine = new SentinelEngine();
    engine.registerRule(criticalFormatRule);
    engine.afterExecute((_, res) => {
      capturedTelemetry = res;
    });

    await engine.evaluate(destructiveContext, { dryRun: true });

    expect(capturedTelemetry).toBeDefined();
    expect(capturedTelemetry.dryRun).toBe(true);
    expect(capturedTelemetry.allowed).toBe(true);
    expect(capturedTelemetry.simulatedVerdict).toBe(Verdict.BLOCK);
    expect(capturedTelemetry.violations[0].ruleId).toBe('block-format-disk');
  });
});
