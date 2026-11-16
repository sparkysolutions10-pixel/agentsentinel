import { createHmac, timingSafeEqual } from 'node:crypto';
/**
 * Computes deterministic canonical representation of an AuditEvent for HMAC signing.
 */
export function canonicalizeAuditEvent(event) {
    // Exclude signature field if already present
    const { eventId, timestamp, agentId, toolName, category, verdict, severity, ruleId, reason, params, latencyMs } = event;
    return JSON.stringify({
        eventId,
        timestamp,
        agentId: agentId ?? null,
        toolName,
        category: category ?? null,
        verdict,
        severity,
        ruleId,
        reason,
        params,
        latencyMs
    });
}
/**
 * Cryptographically signs an AuditEvent with HMAC-SHA256.
 */
export function signAuditEvent(event, secretKey) {
    if (!secretKey) {
        throw new TypeError('[AgentSentinel] Secret key required for HMAC signing.');
    }
    const canonical = canonicalizeAuditEvent(event);
    const signature = createHmac('sha256', secretKey)
        .update(canonical)
        .digest('hex');
    return {
        ...event,
        signature
    };
}
/**
 * Verifies the HMAC-SHA256 signature of a SignedAuditEvent using constant-time comparison.
 */
export function verifyAuditEvent(signedEvent, secretKey) {
    if (!signedEvent.signature || !secretKey) {
        return false;
    }
    try {
        const canonical = canonicalizeAuditEvent(signedEvent);
        const expectedSig = createHmac('sha256', secretKey)
            .update(canonical)
            .digest('hex');
        const expectedBuf = Buffer.from(expectedSig, 'hex');
        const actualBuf = Buffer.from(signedEvent.signature, 'hex');
        if (expectedBuf.length !== actualBuf.length) {
            return false;
        }
        return timingSafeEqual(expectedBuf, actualBuf);
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=integrity.js.map