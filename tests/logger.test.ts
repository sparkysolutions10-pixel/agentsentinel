import { describe, it, expect, vi } from 'vitest';
import { JSONAuditLogger, AuditEvent } from '../src/logger.js';
import { SentinelEngine, Verdict, SentinelRule } from '../src/index.js';

describe('Structured JSON Violation Audit Logger (Issue #12)', () => {
  it('records structured audit events with complete security metadata', () => {
    const logger = new JSONAuditLogger();

    const event = logger.log(
      {
        ruleId: 'block-exec-eval',
        ruleName: 'Eval Blocker',
        severity: 'critical',
        verdict: Verdict.BLOCK,
        reason: 'Unsafe eval call detected',
        detectedPattern: 'eval('
      },
      {
        id: 'call-101',
        agentId: 'agent-finance',
        toolName: 'python:eval',
        category: 'shell',
        params: { code: 'eval(userInput)' },
        timestamp: Date.now()
      },
      0.045
    );

    expect(event.eventId).toBeDefined();
    expect(event.agentId).toBe('agent-finance');
    expect(event.toolName).toBe('python:eval');
    expect(event.category).toBe('shell');
    expect(event.verdict).toBe(Verdict.BLOCK);
    expect(event.severity).toBe('critical');
    expect(event.ruleId).toBe('block-exec-eval');
    expect(event.reason).toBe('Unsafe eval call detected');
    expect(event.detectedPattern).toBe('eval(');
    expect(event.params).toEqual({ code: 'eval(userInput)' });
    expect(event.latencyMs).toBe(0.045);
    expect(typeof event.timestamp).toBe('string');
  });

  it('formats audit events into valid single-line JSON strings', () => {
    const logger = new JSONAuditLogger();
    const event = logger.log(
      {
        ruleId: 'r1',
        ruleName: 'R1',
        severity: 'high',
        verdict: Verdict.REDACT,
        reason: 'Redacted'
      },
      {
        id: 'c1',
        toolName: 'api',
        params: {},
        timestamp: Date.now()
      }
    );

    const formatted = logger.format(event);
    expect(typeof formatted).toBe('string');
    expect(formatted.includes('\n')).toBe(false); // Single line
    const parsed = JSON.parse(formatted);
    expect(parsed.eventId).toBe(event.eventId);
    expect(parsed.verdict).toBe(Verdict.REDACT);
  });

  it('triggers optional sink callback with event and formatted JSON', () => {
    let capturedJson = '';
    const sink = vi.fn((evt: AuditEvent, json: string) => {
      capturedJson = json;
    });

    const logger = new JSONAuditLogger(sink);
    logger.log(
      { ruleId: 'r2', ruleName: 'R2', severity: 'low', verdict: Verdict.CONFIRM, reason: 'Confirm' },
      { id: 'c2', toolName: 'reboot', params: {}, timestamp: Date.now() }
    );

    expect(sink).toHaveBeenCalledTimes(1);
    expect(capturedJson.length).toBeGreaterThan(0);
  });

  it('automatically logs violations during SentinelEngine evaluation', async () => {
    const engine = new SentinelEngine();
    const blockRule: SentinelRule = {
      id: 'auto-logged-rule',
      name: 'Auto Logged',
      category: 'fs',
      priority: 10,
      enabled: true,
      evaluate: () => ({
        ruleId: 'auto-logged-rule',
        ruleName: 'Auto Logged',
        severity: 'critical',
        verdict: Verdict.BLOCK,
        reason: 'Blocked file'
      })
    };

    engine.registerRule(blockRule);

    await engine.evaluate({
      id: 'auto-log-test',
      toolName: 'fs:delete',
      params: { file: 'critical.db' },
      timestamp: Date.now()
    });

    expect(engine.logger.size).toBe(1);
    const events = engine.logger.getEvents();
    expect(events[0].ruleId).toBe('auto-logged-rule');
    expect(events[0].verdict).toBe(Verdict.BLOCK);
  });
});
