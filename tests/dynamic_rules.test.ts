import { describe, it, expect, vi } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import { Verdict, SentinelRule, ToolCallContext } from '../src/types.js';

describe('SentinelEngine - Dynamic Runtime Rule Injection & Revocation (Issue #20)', () => {
  const dummyContext: ToolCallContext = {
    id: 'call-dyn-01',
    toolName: 'shell:execute',
    category: 'shell',
    params: { cmd: 'reboot' },
    timestamp: Date.now(),
  };

  const dynamicRebootRule: SentinelRule = {
    id: 'block-reboot',
    name: 'Block Reboot Command',
    category: 'shell',
    priority: 150,
    enabled: true,
    evaluate: (ctx) => {
      if (ctx.params?.cmd === 'reboot') {
        return {
          ruleId: 'block-reboot',
          ruleName: 'Block Reboot Command',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: 'Dynamic block on reboot commands',
        };
      }
      return null;
    },
  };

  it('allows tool execution before rule injection, then blocks after injection', async () => {
    const engine = new SentinelEngine();

    // 1. Initially allowed
    const res1 = await engine.evaluate(dummyContext);
    expect(res1.verdict).toBe(Verdict.ALLOW);
    expect(res1.allowed).toBe(true);

    // 2. Inject rule at runtime
    engine.injectRule(dynamicRebootRule);
    expect(engine.hasRule('block-reboot')).toBe(true);

    // 3. Immediately blocked on subsequent evaluation
    const res2 = await engine.evaluate(dummyContext);
    expect(res2.verdict).toBe(Verdict.BLOCK);
    expect(res2.allowed).toBe(false);
    expect(res2.violations[0].ruleId).toBe('block-reboot');
  });

  it('revokes an active rule at runtime and restores ALLOW verdict', async () => {
    const engine = new SentinelEngine();
    engine.injectRule(dynamicRebootRule);

    // Blocked
    const res1 = await engine.evaluate(dummyContext);
    expect(res1.verdict).toBe(Verdict.BLOCK);

    // Revoke rule at runtime
    const revoked = engine.revokeRule('block-reboot');
    expect(revoked).toBe(true);
    expect(engine.hasRule('block-reboot')).toBe(false);

    // Subsequent evaluation is now allowed
    const res2 = await engine.evaluate(dummyContext);
    expect(res2.verdict).toBe(Verdict.ALLOW);
    expect(res2.allowed).toBe(true);
    expect(res2.violations).toHaveLength(0);
  });

  it('handles revocation of nonexistent rule gracefully', () => {
    const engine = new SentinelEngine();
    expect(engine.revokeRule('nonexistent')).toBe(false);
  });

  it('supports bulk revocation with revokeRules', async () => {
    const engine = new SentinelEngine();
    engine.injectRule(dynamicRebootRule);
    engine.injectRule({
      ...dynamicRebootRule,
      id: 'rule-2',
      name: 'Rule 2',
    });

    expect(engine.getRegisteredRules().length).toBe(2);

    const revokedCount = engine.revokeRules(['block-reboot', 'rule-2', 'fake-id']);
    expect(revokedCount).toBe(2);
    expect(engine.getRegisteredRules().length).toBe(0);
  });

  it('triggers onRuleInjected and onRuleRevoked listeners', () => {
    const engine = new SentinelEngine();
    const injectedSpy = vi.fn();
    const revokedSpy = vi.fn();

    const unsubInjected = engine.onRuleInjected(injectedSpy);
    const unsubRevoked = engine.onRuleRevoked(revokedSpy);

    engine.injectRule(dynamicRebootRule);
    expect(injectedSpy).toHaveBeenCalledWith(dynamicRebootRule);

    engine.revokeRule('block-reboot');
    expect(revokedSpy).toHaveBeenCalledWith('block-reboot');

    // Test unsubscribe
    unsubInjected();
    unsubRevoked();

    engine.injectRule(dynamicRebootRule);
    expect(injectedSpy).toHaveBeenCalledTimes(1);
  });

  it('dynamically injects declarative policies at runtime via injectPolicy', async () => {
    const engine = new SentinelEngine();

    const injectedIds = engine.injectPolicy({
      version: '1.0',
      rules: [
        {
          id: 'runtime-sql-guard',
          name: 'Runtime SQL Guard',
          category: 'sql',
          priority: 80,
          match: {
            patterns: ['DROP', 'TRUNCATE'],
          },
          action: {
            verdict: 'BLOCK',
            reason: 'Destructive SQL statement detected',
          },
        },
      ],
    });

    expect(injectedIds).toEqual(['runtime-sql-guard']);
    expect(engine.hasRule('runtime-sql-guard')).toBe(true);

    const res = await engine.evaluate({
      id: 'call-sql',
      toolName: 'sql:query',
      category: 'sql',
      params: { query: 'TRUNCATE TABLE logs' },
      timestamp: Date.now(),
    });

    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].ruleId).toBe('runtime-sql-guard');
  });

  it('toggles rule status at runtime via enableRule and disableRule', async () => {
    const engine = new SentinelEngine();
    engine.injectRule(dynamicRebootRule);

    // Disable rule
    expect(engine.disableRule('block-reboot')).toBe(true);
    let res = await engine.evaluate(dummyContext);
    expect(res.verdict).toBe(Verdict.ALLOW);

    // Re-enable rule
    expect(engine.enableRule('block-reboot')).toBe(true);
    res = await engine.evaluate(dummyContext);
    expect(res.verdict).toBe(Verdict.BLOCK);
  });
});
