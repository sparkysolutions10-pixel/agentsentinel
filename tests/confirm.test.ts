import { describe, it, expect, vi } from 'vitest';
import { ConfirmationBridge } from '../src/confirm.js';
import { SentinelEngine } from '../src/index.js';
import { Verdict, ToolCallContext, SentinelRule } from '../src/types.js';

describe('ConfirmationBridge - Human-in-the-Loop Async Bridge (Issue #18)', () => {
  const dummyContext: ToolCallContext = {
    id: 'call-123',
    agentId: 'agent-prod-01',
    toolName: 'db:drop_table',
    category: 'sql',
    params: { table: 'customers' },
    timestamp: Date.now(),
  };

  it('pauses execution until human operator approves the request', async () => {
    const bridge = new ConfirmationBridge({ defaultTimeoutMs: 5000 });
    let capturedRequestId: string = '';

    bridge.onRequest((summary) => {
      capturedRequestId = summary.requestId;
      expect(summary.toolName).toBe('db:drop_table');
      expect(summary.params).toEqual({ table: 'customers' });
    });

    const promise = bridge.requestConfirmation(dummyContext);

    expect(bridge.pendingCount).toBe(1);
    expect(capturedRequestId).toBeTruthy();

    // Human operator reviews and approves
    const approved = bridge.approve(capturedRequestId, 'Authorized by lead security engineer');
    expect(approved).toBe(true);

    const decision = await promise;
    expect(decision.approved).toBe(true);
    expect(decision.verdict).toBe(Verdict.ALLOW);
    expect(decision.reason).toBe('Authorized by lead security engineer');
    expect(decision.timedOut).toBe(false);
    expect(decision.latencyMs).toBeGreaterThanOrEqual(0);
    expect(bridge.pendingCount).toBe(0);
  });

  it('pauses execution until human operator rejects the request', async () => {
    const bridge = new ConfirmationBridge({ defaultTimeoutMs: 5000 });
    let capturedRequestId: string = '';

    bridge.onRequest((summary) => {
      capturedRequestId = summary.requestId;
    });

    const promise = bridge.requestConfirmation(dummyContext);

    // Operator rejects
    const rejected = bridge.reject(capturedRequestId, 'Untrusted operation blocked by operator');
    expect(rejected).toBe(true);

    const decision = await promise;
    expect(decision.approved).toBe(false);
    expect(decision.verdict).toBe(Verdict.BLOCK);
    expect(decision.reason).toBe('Untrusted operation blocked by operator');
    expect(decision.timedOut).toBe(false);
    expect(bridge.pendingCount).toBe(0);
  });

  it('returns false when approving or rejecting a nonexistent request', () => {
    const bridge = new ConfirmationBridge();
    expect(bridge.approve('nonexistent_id')).toBe(false);
    expect(bridge.reject('nonexistent_id')).toBe(false);
  });

  it('integrates seamlessly with SentinelEngine when rule triggers CONFIRM', async () => {
    const bridge = new ConfirmationBridge({ defaultTimeoutMs: 5000 });
    const engine = new SentinelEngine();
    engine.setConfirmationBridge(bridge);

    const confirmRule: SentinelRule = {
      id: 'high-risk-db-write',
      name: 'High Risk Database Mutation',
      category: 'sql',
      priority: 100,
      enabled: true,
      evaluate: (ctx) => {
        if (ctx.toolName.startsWith('db:drop')) {
          return {
            ruleId: 'high-risk-db-write',
            ruleName: 'High Risk Database Mutation',
            severity: 'high',
            verdict: Verdict.CONFIRM,
            reason: 'Dropping database tables requires explicit operator confirmation',
          };
        }
        return null;
      },
    };

    engine.registerRule(confirmRule);

    // Auto-approve after a slight delay
    bridge.onRequest((summary) => {
      setTimeout(() => {
        bridge.approve(summary.requestId, 'Operator approved schema migration');
      }, 20);
    });

    const evalResult = await engine.evaluate(dummyContext);
    expect(evalResult.verdict).toBe(Verdict.ALLOW);
    expect(evalResult.allowed).toBe(true);
    expect(evalResult.confirmDecision).toBeDefined();
    expect(evalResult.confirmDecision?.approved).toBe(true);
    expect(evalResult.confirmDecision?.reason).toBe('Operator approved schema migration');
  });

  it('tracks multiple concurrent pending requests independently', async () => {
    const bridge = new ConfirmationBridge({ defaultTimeoutMs: 5000 });
    const requestIds: string[] = [];

    bridge.onRequest((summary) => {
      requestIds.push(summary.requestId);
    });

    const p1 = bridge.requestConfirmation({ ...dummyContext, id: 'call-1' });
    const p2 = bridge.requestConfirmation({ ...dummyContext, id: 'call-2' });

    expect(bridge.pendingCount).toBe(2);
    expect(requestIds.length).toBe(2);

    // Approve call-1, reject call-2
    bridge.approve(requestIds[0], 'Approve 1');
    bridge.reject(requestIds[1], 'Reject 2');

    const [d1, d2] = await Promise.all([p1, p2]);
    expect(d1.approved).toBe(true);
    expect(d2.approved).toBe(false);
    expect(bridge.pendingCount).toBe(0);
  });
});
