import { AuditEvent } from './logger.js';
export interface SignedAuditEvent extends AuditEvent {
    signature: string;
}
/**
 * Computes deterministic canonical representation of an AuditEvent for HMAC signing.
 */
export declare function canonicalizeAuditEvent(event: AuditEvent): string;
/**
 * Cryptographically signs an AuditEvent with HMAC-SHA256.
 */
export declare function signAuditEvent(event: AuditEvent, secretKey: string): SignedAuditEvent;
/**
 * Verifies the HMAC-SHA256 signature of a SignedAuditEvent using constant-time comparison.
 */
export declare function verifyAuditEvent(signedEvent: SignedAuditEvent, secretKey: string): boolean;
//# sourceMappingURL=integrity.d.ts.map