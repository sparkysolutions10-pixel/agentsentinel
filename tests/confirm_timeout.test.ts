import { describe, it, expect } from 'vitest';
import { ConfirmationBridge } from '../src/confirm.js';
import { SentinelEngine } from '../src/index.js';
import { Verdict, ToolCallContext, SentinelRule } from '../src/types.js';

describe('ConfirmationBridge - Timeout & Fallback Rejection (Issue #19)', () => {
  const dummyContext: ToolCallContext = {
    id: 'call-timeout-test',
    agentId: 'agent-prod-02',
    toolName: 'system:shutdown',
    category: 'shell',
    params: { force: true },
    timestamp: Date.now(),
  };

  it('automatically defaults to BLOCK when timeout expires without operator response', async () => {
    const bridge = new ConfirmationBridge({ defaultTimeoutMs: 50 });

    const startTime = Date.now();
    const decision = await bridge.requestConfirmation(dummyContext);
    const duration = Date.now() - startTime;

    expect(decision.approved).toBe(false);
    expect(decision.verdict).toBe(Verdict.BLOCK);
    expect(decision.timedOut).toBe(true);
    expect(decision.reason).toContain('timed out');
    expect(duration).toBeGreaterThanOrEqual(40);
    expect(bridge.pendingCount).toBe(0);
  });

  it('honors per-request timeout override over default bridge timeout', async () => {
    const bridge = new ConfirmationBridge({ defaultTimeoutMs: 10_000 });

    const startTime = Date.now();
    const decision = await bridge.requestConfirmation(dummyContext, { timeoutMs: 40 });
    const duration = Date.now() - startTime;

    expect(decision.approved).toBe(false);
    expect(decision.verdict).toBe(Verdict.BLOCK);
    expect(decision.timedOut).toBe(true);
    expect(duration).toBeLessThan(1000); // Definitely did not wait 10s
    expect(bridge.pendingCount).toBe(0);
  });

  it('causes SentinelEngine to BLOCK when confirmation times out in the pipeline', async () => {
    const bridge = new ConfirmationBridge({ defaultTimeoutMs: 50 });
    const engine = new SentinelEngine();
    engine.setConfirmationBridge(bridge);

    const shutdownRule: SentinelRule = {
      id: 'confirm-shutdown',
      name: 'Confirm System Shutdown',
      category: 'shell',
      priority: 100,
      enabled: true,
      evaluate: (ctx) => {
        if (ctx.toolName === 'system:shutdown') {
          return {
            ruleId: 'confirm-shutdown',
            ruleName: 'Confirm System Shutdown',
            severity: 'critical',
            verdict: Verdict.CONFIRM,
            reason: 'System shutdown requires operator consent',
          };
        }
        return null;
      },
    };

    engine.registerRule(shutdownRule);

    const result = await engine.evaluate(dummyContext);
    expect(result.verdict).toBe(Verdict.BLOCK);
    expect(result.allowed).toBe(false);
    expect(result.confirmDecision).toBeDefined();
    expect(result.confirmDecision?.approved).toBe(false);
    expect(result.confirmDecision?.timedOut).toBe(true);
    expect(result.confirmDecision?.verdict).toBe(Verdict.BLOCK);
  });

  it('returns false if approve or reject is called after request has already timed out', async () => {
    const bridge = new ConfirmationBridge({ defaultTimeoutMs: 30 });
    let reqId = '';

    bridge.onRequest((req) => {
      reqId = req.requestId;
    });

    const decision = await bridge.requestConfirmation(dummyContext);
    expect(decision.timedOut).toBe(true);

    // Now try to approve or reject the stale request
    const approveAttempt = bridge.approve(reqId);
    const rejectAttempt = bridge.reject(reqId);

    expect(approveAttempt).toBe(false);
    expect(rejectAttempt).toBe(false);
  });

  it('safely rejects all pending requests when bridge.clear() is invoked', async () => {
    const bridge = new ConfirmationBridge({ defaultTimeoutMs: 5000 });

    const p1 = bridge.requestConfirmation({ ...dummyContext, id: 'req-clear-1' });
    const p2 = bridge.requestConfirmation({ ...dummyContext, id: 'req-clear-2' });

    expect(bridge.pendingCount).toBe(2);

    bridge.clear();

    const [d1, d2] = await Promise.all([p1, p2]);
    expect(d1.approved).toBe(false);
    expect(d1.verdict).toBe(Verdict.BLOCK);
    expect(d1.reason).toContain('cleared');
    expect(d2.approved).toBe(false);
    expect(d2.verdict).toBe(Verdict.BLOCK);
    expect(bridge.pendingCount).toBe(0);
  });
});
