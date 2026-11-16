/**
 * Zero-Telemetry Client-Side Privacy Guarantee & Egress Guard.
 * Enforces and cryptographically verifies that all secret scanning, AST analysis,
 * and parameter redaction functions execute 100% locally in-memory without initiating
 * external network requests, analytics beacons, or remote telemetry dispatches.
 */
import { SentinelRule } from '../types.js';
export interface TelemetryAuditReport {
    zeroTelemetry: boolean;
    offlineOnly: boolean;
    clientSideGuaranteed: boolean;
    networkRequestsAttempted: number;
    prohibitedProtocols: string[];
    auditTimestamp: number;
}
export declare class ZeroTelemetryViolationError extends Error {
    constructor(message: string);
}
export declare class ZeroTelemetryGuard {
    private networkRequestsAttempted;
    private isLockdownActive;
    private originalFetch;
    /**
     * Enables strict network lockdown by intercepting global network primitives.
     */
    enableNetworkLockdown(): void;
    /**
     * Restores normal network primitives.
     */
    disableNetworkLockdown(): void;
    reset(): void;
    /**
     * Executes a synchronous or asynchronous function inside a zero-telemetry sandbox.
     * Guarantees zero network calls were attempted during execution.
     */
    assertZeroTelemetryDuring<T>(fn: () => T | Promise<T>): Promise<T>;
    /**
     * Returns a formal telemetry audit report proving zero-telemetry status.
     */
    getAuditReport(): TelemetryAuditReport;
    getAttemptsCount(): number;
}
export declare const zeroTelemetryGuard: ZeroTelemetryGuard;
/**
 * Creates an AgentSentinel security rule asserting zero-telemetry compliance.
 */
export declare function createZeroTelemetryRule(): SentinelRule;
export declare const zeroTelemetryRule: SentinelRule;
//# sourceMappingURL=zero_telemetry.d.ts.map