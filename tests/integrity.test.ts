import { describe, it, expect } from 'vitest';
import {
  signAuditEvent,
  verifyAuditEvent,
  canonicalizeAuditEvent
} from '../src/integrity.js';
import { JSONAuditLogger, AuditEvent } from '../src/logger.js';
import { Verdict } from '../src/types.js';

describe('HMAC-SHA256 Integrity Seal (Issue #14)', () => {
  const SECRET_KEY = 'super-secret-sentinel-vault-key-32b';

  const sampleEvent: AuditEvent = {
    eventId: 'evt-12345',
    timestamp: '2026-10-29T08:00:00.000Z',
    agentId: 'agent-alpha',
    toolName: 'bash:exec',
    category: 'shell',
    verdict: Verdict.BLOCK,
    severity: 'critical',
    ruleId: 'rm-rf-rule',
    ruleName: 'Root Deletion Blocker',
    reason: 'Prohibited command execution',
    params: { cmd: 'rm -rf /' },
    latencyMs: 0.05
  };

  it('signs an audit event producing a 64-character SHA256 hex signature', () => {
    const signed = signAuditEvent(sampleEvent, SECRET_KEY);
    expect(signed.signature).toBeDefined();
    expect(signed.signature.length).toBe(64);
    expect(/^[0-9a-f]{64}$/.test(signed.signature)).toBe(true);
  });

  it('verifies untampered signed events successfully', () => {
    const signed = signAuditEvent(sampleEvent, SECRET_KEY);
    const isValid = verifyAuditEvent(signed, SECRET_KEY);
    expect(isValid).toBe(true);
  });

  it('detects tampering and rejects verification when any field is altered', () => {
    const signed = signAuditEvent(sampleEvent, SECRET_KEY);

    // Tamper with verdict
    const tamperedVerdict = { ...signed, verdict: Verdict.ALLOW };
    expect(verifyAuditEvent(tamperedVerdict, SECRET_KEY)).toBe(false);

    // Tamper with parameters
    const tamperedParams = { ...signed, params: { cmd: 'echo safe' } };
    expect(verifyAuditEvent(tamperedParams, SECRET_KEY)).toBe(false);

    // Tamper with wrong secret key
    expect(verifyAuditEvent(signed, 'wrong-secret-key')).toBe(false);
  });

  it('integrates HMAC sealing automatically into JSONAuditLogger', () => {
    const logger = new JSONAuditLogger(undefined, SECRET_KEY);
    const event = logger.log(
      {
        ruleId: 'r-auto-seal',
        ruleName: 'Auto Seal',
        severity: 'high',
        verdict: Verdict.BLOCK,
        reason: 'Sealed violation'
      },
      {
        id: 'call-auto',
        toolName: 'db:drop',
        params: { table: 'users' },
        timestamp: Date.now()
      }
    );

    expect(event.signature).toBeDefined();
    expect(verifyAuditEvent(event as any, SECRET_KEY)).toBe(true);
  });
});
