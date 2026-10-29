import { describe, it, expect } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import { Verdict, SentinelRule, ToolCallContext } from '../src/types.js';

describe('SentinelEngine - Dynamic Rule Hot-Reloading Suite (Issue #21)', () => {
  const dummyContext: ToolCallContext = {
    id: 'call-hot-01',
    toolName: 'shell:execute',
    category: 'shell',
    params: { cmd: 'git push --force origin main' },
    timestamp: Date.now(),
  };

  it('hot-swaps existing rule logic with updated verdict on same rule ID', async () => {
    const engine = new SentinelEngine();

    // Version 1: Alert with REDACT/CONFIRM
    const ruleV1: SentinelRule = {
      id: 'git-force-guard',
      name: 'Git Force Push Guard',
      category: 'shell',
      priority: 50,
      enabled: true,
      evaluate: (ctx) => {
        if (ctx.params?.cmd?.includes('--force')) {
          return {
            ruleId: 'git-force-guard',
            ruleName: 'Git Force Push Guard',
            severity: 'medium',
            verdict: Verdict.CONFIRM,
            reason: 'Force push requires confirmation in dev mode',
          };
        }
        return null;
      },
    };

    engine.injectRule(ruleV1);
    const res1 = await engine.evaluate(dummyContext);
    expect(res1.verdict).toBe(Verdict.CONFIRM);

    // Version 2: Hot-reload with strict BLOCK verdict for production
    const ruleV2: SentinelRule = {
      id: 'git-force-guard',
      name: 'Git Force Push Guard',
      category: 'shell',
      priority: 50,
      enabled: true,
      evaluate: (ctx) => {
        if (ctx.params?.cmd?.includes('--force')) {
          return {
            ruleId: 'git-force-guard',
            ruleName: 'Git Force Push Guard',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: 'Strict BLOCK on force pushing to main branch',
          };
        }
        return null;
      },
    };

    engine.injectRule(ruleV2);

    // Verify hot-swap immediately alters subsequent evaluation
    const res2 = await engine.evaluate(dummyContext);
    expect(res2.verdict).toBe(Verdict.BLOCK);
    expect(res2.violations[0].reason).toBe('Strict BLOCK on force pushing to main branch');
    expect(engine.getRegisteredRules().length).toBe(1); // Replaced in-place, not duplicated
  });

  it('hot-reloads rule priority to change evaluation precedence', async () => {
    const engine = new SentinelEngine();

    const lowPriorityBlockRule: SentinelRule = {
      id: 'low-prio-block',
      name: 'Low Priority Block',
      category: 'shell',
      priority: 10,
      enabled: true,
      evaluate: () => ({
        ruleId: 'low-prio-block',
        ruleName: 'Low Priority Block',
        severity: 'high',
        verdict: Verdict.BLOCK,
        reason: 'Low priority block',
      }),
    };

    const confirmRule: SentinelRule = {
      id: 'confirm-first',
      name: 'Confirm First',
      category: 'shell',
      priority: 50,
      enabled: true,
      evaluate: () => ({
        ruleId: 'confirm-first',
        ruleName: 'Confirm First',
        severity: 'medium',
        verdict: Verdict.CONFIRM,
        reason: 'Confirm first',
      }),
    };

    engine.injectRule(lowPriorityBlockRule);
    engine.injectRule(confirmRule);

    // At priority 50 vs 10: confirmRule runs first, then lowPriorityBlockRule runs and triggers BLOCK
    const res1 = await engine.evaluate(dummyContext);
    expect(res1.verdict).toBe(Verdict.BLOCK);
    expect(res1.violations[0].ruleId).toBe('confirm-first');
    expect(res1.violations[1].ruleId).toBe('low-prio-block');

    // Hot-reload lowPriorityBlockRule with priority 200
    engine.injectRule({
      ...lowPriorityBlockRule,
      priority: 200,
    });

    // Now lowPriorityBlockRule runs first and short-circuits before confirmRule!
    const res2 = await engine.evaluate(dummyContext);
    expect(res2.verdict).toBe(Verdict.BLOCK);
    expect(res2.violations).toHaveLength(1);
    expect(res2.violations[0].ruleId).toBe('low-prio-block');
  });

  it('handles hot-reloading seamlessly during concurrent evaluation throughput', async () => {
    const engine = new SentinelEngine();

    const baseRule: SentinelRule = {
      id: 'concurrent-guard',
      name: 'Concurrent Guard',
      category: 'shell',
      priority: 100,
      enabled: true,
      evaluate: (ctx) => {
        if (ctx.params?.cmd?.includes('dangerous')) {
          return {
            ruleId: 'concurrent-guard',
            ruleName: 'Concurrent Guard',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: 'Dangerous payload',
          };
        }
        return null;
      },
    };

    engine.injectRule(baseRule);

    // Launch 100 parallel evaluations while simultaneously hot-reloading rules
    const promises = Array.from({ length: 100 }).map((_, i) => {
      const isDangerous = i % 2 === 0;
      const ctx: ToolCallContext = {
        id: `call-concurrent-${i}`,
        toolName: 'shell:exec',
        category: 'shell',
        params: { cmd: isDangerous ? 'dangerous rm' : 'safe ls' },
        timestamp: Date.now(),
      };

      if (i === 50) {
        // Hot-reload mid-flight
        engine.injectRule({
          ...baseRule,
          name: 'Updated Mid-Flight Guard',
        });
      }

      return engine.evaluate(ctx);
    });

    const results = await Promise.all(promises);
    expect(results).toHaveLength(100);

    for (let i = 0; i < 100; i++) {
      const isDangerous = i % 2 === 0;
      if (isDangerous) {
        expect(results[i].verdict).toBe(Verdict.BLOCK);
      } else {
        expect(results[i].verdict).toBe(Verdict.ALLOW);
      }
    }
  });

  it('hot-replaces an entire policy bundle cleanly', async () => {
    const engine = new SentinelEngine();

    // Deploy Bundle 1
    const bundle1Ids = engine.injectPolicy({
      version: '1.0',
      rules: [
        {
          id: 'bundle1-rule-1',
          name: 'B1 Rule 1',
          category: 'shell',
          priority: 50,
          match: { patterns: ['curl'] },
          action: { verdict: 'BLOCK', reason: 'Blocked in v1' },
        },
      ],
    });
    expect(bundle1Ids).toEqual(['bundle1-rule-1']);

    let res = await engine.evaluate({
      id: 'c1',
      toolName: 'shell:exec',
      category: 'shell',
      params: { cmd: 'curl https://example.com' },
      timestamp: Date.now(),
    });
    expect(res.verdict).toBe(Verdict.BLOCK);

    // Hot-revoke bundle 1 and inject Bundle 2
    engine.revokeRules(bundle1Ids);

    const bundle2Ids = engine.injectPolicy({
      version: '2.0',
      rules: [
        {
          id: 'bundle2-rule-1',
          name: 'B2 Rule 1',
          category: 'shell',
          priority: 50,
          match: { patterns: ['wget'] },
          action: { verdict: 'BLOCK', reason: 'Blocked in v2' },
        },
      ],
    });

    // curl is now allowed in v2
    res = await engine.evaluate({
      id: 'c2',
      toolName: 'shell:exec',
      category: 'shell',
      params: { cmd: 'curl https://example.com' },
      timestamp: Date.now(),
    });
    expect(res.verdict).toBe(Verdict.ALLOW);

    // wget is now blocked in v2
    res = await engine.evaluate({
      id: 'c3',
      toolName: 'shell:exec',
      category: 'shell',
      params: { cmd: 'wget https://example.com' },
      timestamp: Date.now(),
    });
    expect(res.verdict).toBe(Verdict.BLOCK);
    expect(res.violations[0].ruleId).toBe('bundle2-rule-1');
  });
});
