import { describe, it, expect } from 'vitest';
import { signAuditEvent, verifyAuditEvent, SignedAuditEvent } from '../src/integrity.js';
import { Verdict } from '../src/types.js';

describe('HMAC Tamper Detection & Forensic Integrity (Issue #15)', () => {
  const SECRET_KEY = 'forensic-audit-key-2026-megaagent';

  const baseEvent = {
    eventId: '3c9b1d8e-7b2a-4f5c-8d1e-9a0b1c2d3e4f',
    timestamp: '2026-10-29T12:00:00.000Z',
    agentId: 'autonomous-auditor-1',
    toolName: 'bash:exec',
    category: 'shell' as const,
    verdict: Verdict.BLOCK,
    severity: 'critical' as const,
    ruleId: 'block-destructive-wipe',
    ruleName: 'Disk Wipe Blocker',
    reason: 'Raw disk wipe blocked',
    params: { command: 'dd if=/dev/zero of=/dev/sda', force: true },
    latencyMs: 0.082
  };

  const signedEvent: SignedAuditEvent = signAuditEvent(baseEvent, SECRET_KEY);

  it('confirms the pristine signed event passes verification', () => {
    expect(verifyAuditEvent(signedEvent, SECRET_KEY)).toBe(true);
  });

  it('fails verification on tampering with string identifiers', () => {
    // 1. Alter eventId
    expect(verifyAuditEvent({ ...signedEvent, eventId: 'altered-id' }, SECRET_KEY)).toBe(false);

    // 2. Alter toolName
    expect(verifyAuditEvent({ ...signedEvent, toolName: 'bash:run' }, SECRET_KEY)).toBe(false);

    // 3. Alter agentId
    expect(verifyAuditEvent({ ...signedEvent, agentId: 'rogue-agent' }, SECRET_KEY)).toBe(false);

    // 4. Alter ruleId
    expect(verifyAuditEvent({ ...signedEvent, ruleId: 'other-rule' }, SECRET_KEY)).toBe(false);
  });

  it('fails verification on tampering with security verdict or severity', () => {
    // Changing BLOCK to ALLOW
    expect(verifyAuditEvent({ ...signedEvent, verdict: Verdict.ALLOW }, SECRET_KEY)).toBe(false);

    // Changing severity from critical to low
    expect(verifyAuditEvent({ ...signedEvent, severity: 'low' }, SECRET_KEY)).toBe(false);
  });

  it('fails verification on tampering with parameters or nested arguments', () => {
    // Modifying command parameter
    expect(verifyAuditEvent({
      ...signedEvent,
      params: { command: 'echo benign', force: true }
    }, SECRET_KEY)).toBe(false);

    // Appending a covert parameter
    expect(verifyAuditEvent({
      ...signedEvent,
      params: { ...signedEvent.params, hiddenParam: 'injected' }
    }, SECRET_KEY)).toBe(false);
  });

  it('fails verification on signature mutation, truncation, or corruption', () => {
    // Flipping last byte of signature
    const lastChar = signedEvent.signature.slice(-1);
    const flippedChar = lastChar === 'a' ? 'b' : 'a';
    const mutatedSig = signedEvent.signature.slice(0, -1) + flippedChar;

    expect(verifyAuditEvent({ ...signedEvent, signature: mutatedSig }, SECRET_KEY)).toBe(false);

    // Truncated signature (odd length)
    expect(verifyAuditEvent({ ...signedEvent, signature: signedEvent.signature.slice(0, 63) }, SECRET_KEY)).toBe(false);

    // Completely bogus signature
    expect(verifyAuditEvent({ ...signedEvent, signature: 'deadbeef' }, SECRET_KEY)).toBe(false);

    // Empty signature
    expect(verifyAuditEvent({ ...signedEvent, signature: '' }, SECRET_KEY)).toBe(false);
  });
});
