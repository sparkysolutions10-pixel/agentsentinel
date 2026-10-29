import { describe, it, expect } from 'vitest';
import { JSONAuditLogger, AuditEvent } from '../src/logger.js';
import { Verdict } from '../src/types.js';

describe('Audit Logger Schema & SIEM Formatting (Issue #13)', () => {
  const ISO_8601_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  it('strictly adheres to the SIEM / OpenTelemetry JSON event schema', () => {
    const logger = new JSONAuditLogger();
    const event = logger.log(
      {
        ruleId: 'sec-rule-404',
        ruleName: 'Directory Traversal Guard',
        severity: 'high',
        verdict: Verdict.BLOCK,
        reason: 'Path traversal attempt ../.. detected',
        detectedPattern: '../..'
      },
      {
        id: 'ctx-999',
        agentId: 'worker-agent-12',
        toolName: 'fs:read',
        category: 'fs',
        params: { path: '../../etc/passwd', flag: 'r' },
        timestamp: Date.now()
      },
      0.125
    );

    const jsonString = logger.format(event);
    const parsed = JSON.parse(jsonString);

    // Schema structure assertions
    expect(parsed.eventId).toMatch(UUID_V4_REGEX);
    expect(parsed.timestamp).toMatch(ISO_8601_REGEX);
    expect(new Date(parsed.timestamp).getTime()).not.toBeNaN();
    expect(parsed.agentId).toBe('worker-agent-12');
    expect(parsed.toolName).toBe('fs:read');
    expect(parsed.category).toBe('fs');
    expect(parsed.verdict).toBe('BLOCK');
    expect(['low', 'medium', 'high', 'critical']).toContain(parsed.severity);
    expect(parsed.ruleId).toBe('sec-rule-404');
    expect(parsed.ruleName).toBe('Directory Traversal Guard');
    expect(parsed.reason).toBe('Path traversal attempt ../.. detected');
    expect(parsed.detectedPattern).toBe('../..');
    expect(parsed.params).toEqual({ path: '../../etc/passwd', flag: 'r' });
    expect(parsed.latencyMs).toBe(0.125);
  });

  it('safely serializes complex unicode, symbols, and nested structures', () => {
    const logger = new JSONAuditLogger();
    const event = logger.log(
      {
        ruleId: 'unicode-rule',
        ruleName: 'Unicode Test',
        severity: 'low',
        verdict: Verdict.ALLOW,
        reason: 'Valid multi-lingual prompt'
      },
      {
        id: 'unicode-ctx',
        toolName: 'translate',
        params: {
          japanese: 'こんにちは',
          hindi: 'नमस्ते',
          emojis: '🛡️⚡🚀',
          escapes: 'line1\nline2\ttab'
        },
        timestamp: Date.now()
      }
    );

    const json = logger.format(event);
    const roundtrip = JSON.parse(json);

    expect(roundtrip.params.japanese).toBe('こんにちは');
    expect(roundtrip.params.hindi).toBe('नमस्ते');
    expect(roundtrip.params.emojis).toBe('🛡️⚡🚀');
    expect(roundtrip.params.escapes).toBe('line1\nline2\ttab');
  });
});
