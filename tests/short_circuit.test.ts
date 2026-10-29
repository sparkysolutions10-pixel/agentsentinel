import { describe, it, expect, vi } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import { SentinelRule, Verdict } from '../src/types.js';

describe('Priority Ordering & Short-Circuit Evaluation (Issue #7)', () => {
  it('strictly short-circuits evaluation when a high-priority rule produces a BLOCK verdict', async () => {
    const engine = new SentinelEngine();
    const evaluatedRuleIds: string[] = [];

    const highPriorityBlockRule: SentinelRule = {
      id: 'rule-priority-100-block',
      name: 'High Priority Blocking Guard',
      category: 'shell',
      priority: 100,
      enabled: true,
      evaluate: () => {
        evaluatedRuleIds.push('rule-priority-100-block');
        return {
          ruleId: 'rule-priority-100-block',
          ruleName: 'High Priority Blocking Guard',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: 'Immediate security block'
        };
      }
    };

    const midPriorityRule: SentinelRule = {
      id: 'rule-priority-50-inspector',
      name: 'Mid Priority Inspector',
      category: 'shell',
      priority: 50,
      enabled: true,
      evaluate: () => {
        evaluatedRuleIds.push('rule-priority-50-inspector');
        return null;
      }
    };

    const lowPriorityRule: SentinelRule = {
      id: 'rule-priority-10-logger',
      name: 'Low Priority Logger',
      category: 'custom',
      priority: 10,
      enabled: true,
      evaluate: () => {
        evaluatedRuleIds.push('rule-priority-10-logger');
        return null;
      }
    };

    engine.registerRules([lowPriorityRule, highPriorityBlockRule, midPriorityRule]);

    const result = await engine.evaluate({
      id: 'short-circuit-1',
      toolName: 'bash:exec',
      params: { cmd: 'danger' },
      timestamp: Date.now()
    });

    expect(result.verdict).toBe(Verdict.BLOCK);
    expect(result.allowed).toBe(false);
    expect(evaluatedRuleIds).toEqual(['rule-priority-100-block']);
    expect(evaluatedRuleIds).not.toContain('rule-priority-50-inspector');
    expect(evaluatedRuleIds).not.toContain('rule-priority-10-logger');
  });

  it('continues evaluation through REDACT and CONFIRM until BLOCK is encountered', async () => {
    const engine = new SentinelEngine();
    const evaluatedRules: string[] = [];

    const redactRule: SentinelRule = {
      id: 'p90-redact',
      name: 'P90 Redact',
      category: 'secrets',
      priority: 90,
      enabled: true,
      evaluate: (ctx) => {
        evaluatedRules.push('p90-redact');
        return {
          ruleId: 'p90-redact',
          ruleName: 'P90 Redact',
          severity: 'high',
          verdict: Verdict.REDACT,
          reason: 'Secret scrubbed',
          redactedParams: { ...ctx.params, token: '[REDACTED]' }
        };
      }
    };

    const confirmRule: SentinelRule = {
      id: 'p70-confirm',
      name: 'P70 Confirm',
      category: 'custom',
      priority: 70,
      enabled: true,
      evaluate: () => {
        evaluatedRules.push('p70-confirm');
        return {
          ruleId: 'p70-confirm',
          ruleName: 'P70 Confirm',
          severity: 'medium',
          verdict: Verdict.CONFIRM,
          reason: 'Requires approval'
        };
      }
    };

    const blockRule: SentinelRule = {
      id: 'p30-block',
      name: 'P30 Block',
      category: 'shell',
      priority: 30,
      enabled: true,
      evaluate: () => {
        evaluatedRules.push('p30-block');
        return {
          ruleId: 'p30-block',
          ruleName: 'P30 Block',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: 'Final stop'
        };
      }
    };

    const lowestRule: SentinelRule = {
      id: 'p10-never-run',
      name: 'P10 Never Run',
      category: 'custom',
      priority: 10,
      enabled: true,
      evaluate: () => {
        evaluatedRules.push('p10-never-run');
        return null;
      }
    };

    engine.registerRules([blockRule, redactRule, lowestRule, confirmRule]);

    const result = await engine.evaluate({
      id: 'multi-verdict-1',
      toolName: 'tool:multi',
      params: { token: 'secret-123' },
      timestamp: Date.now()
    });

    expect(evaluatedRules).toEqual(['p90-redact', 'p70-confirm', 'p30-block']);
    expect(evaluatedRules).not.toContain('p10-never-run');
    expect(result.verdict).toBe(Verdict.BLOCK);
    expect(result.allowed).toBe(false);
    expect(result.violations.length).toBe(3);
  });
});
