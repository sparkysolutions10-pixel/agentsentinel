import { describe, it, expect } from 'vitest';
import { SentinelEngine } from '../src/index.js';
import { Verdict, SentinelRule, ToolCallContext } from '../src/types.js';

describe('SentinelEngine - Foundational Pipeline', () => {
  it('allows safe tool calls when no rules match', async () => {
    const engine = new SentinelEngine();
    const result = await engine.evaluate({
      id: 'test_1',
      toolName: 'read_file',
      params: { path: './README.md' },
      timestamp: Date.now()
    });

    expect(result.verdict).toBe(Verdict.ALLOW);
    expect(result.allowed).toBe(true);
    expect(result.violations.length).toBe(0);
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('blocks tool calls when a blocking rule evaluates to violation', async () => {
    const engine = new SentinelEngine();
    const mockBlockRule: SentinelRule = {
      id: 'mock-block',
      name: 'Mock Destructive Command Blocker',
      category: 'shell',
      priority: 100,
      enabled: true,
      evaluate: (ctx: ToolCallContext) => {
        if (ctx.params.command?.includes('rm -rf')) {
          return {
            ruleId: 'mock-block',
            ruleName: 'Mock Destructive Command Blocker',
            severity: 'critical',
            verdict: Verdict.BLOCK,
            reason: 'Destructive deletion prohibited',
            detectedPattern: 'rm -rf'
          };
        }
        return null;
      }
    };

    engine.registerRule(mockBlockRule);

    const result = await engine.evaluate({
      id: 'test_2',
      toolName: 'bash:execute',
      params: { command: 'rm -rf /' },
      timestamp: Date.now()
    });

    expect(result.verdict).toBe(Verdict.BLOCK);
    expect(result.allowed).toBe(false);
    expect(result.violations.length).toBe(1);
    expect(result.violations[0].ruleId).toBe('mock-block');
  });

  it('redacts sensitive parameters when a redaction rule matches', async () => {
    const engine = new SentinelEngine();
    const mockRedactRule: SentinelRule = {
      id: 'mock-redact',
      name: 'Mock API Key Redactor',
      category: 'secrets',
      priority: 50,
      enabled: true,
      evaluate: (ctx: ToolCallContext) => {
        if (ctx.params.apiKey?.startsWith('sk-proj-')) {
          return {
            ruleId: 'mock-redact',
            ruleName: 'Mock API Key Redactor',
            severity: 'high',
            verdict: Verdict.REDACT,
            reason: 'API key detected and scrubbed',
            redactedParams: {
              ...ctx.params,
              apiKey: '[REDACTED_API_KEY]'
            }
          };
        }
        return null;
      }
    };

    engine.registerRule(mockRedactRule);

    const result = await engine.evaluate({
      id: 'test_3',
      toolName: 'api:call',
      params: { apiKey: 'sk-proj-12345abcdef' },
      timestamp: Date.now()
    });

    expect(result.verdict).toBe(Verdict.REDACT);
    expect(result.allowed).toBe(true);
    expect(result.redactedParams?.apiKey).toBe('[REDACTED_API_KEY]');
  });

  it('executes beforeExecute, afterExecute, and onViolation lifecycle hooks', async () => {
    const engine = new SentinelEngine();
    const callOrder: string[] = [];
    let receivedViolationRuleId = '';
    let afterVerdict: Verdict | null = null;

    engine
      .beforeExecute((ctx) => {
        callOrder.push('beforeExecute');
        return {
          ...ctx,
          params: { ...ctx.params, injectedParam: 'secure_token' }
        };
      })
      .onViolation((violation) => {
        callOrder.push('onViolation');
        receivedViolationRuleId = violation.ruleId;
      })
      .afterExecute((ctx, res) => {
        callOrder.push('afterExecute');
        afterVerdict = res.verdict;
      });

    const mockRule: SentinelRule = {
      id: 'rule-violation-test',
      name: 'Violation Tester',
      category: 'custom',
      priority: 10,
      enabled: true,
      evaluate: (ctx) => {
        if (ctx.params.injectedParam === 'secure_token') {
          return {
            ruleId: 'rule-violation-test',
            ruleName: 'Violation Tester',
            severity: 'medium',
            verdict: Verdict.CONFIRM,
            reason: 'Requires user confirmation'
          };
        }
        return null;
      }
    };

    engine.registerRule(mockRule);

    const result = await engine.evaluate({
      id: 'test_lifecycle',
      toolName: 'system:reboot',
      params: {},
      timestamp: Date.now()
    });

    expect(callOrder).toEqual(['beforeExecute', 'onViolation', 'afterExecute']);
    expect(receivedViolationRuleId).toBe('rule-violation-test');
    expect(afterVerdict).toBe(Verdict.CONFIRM);
    expect(result.verdict).toBe(Verdict.CONFIRM);
  });
});
