/**
 * AgentSentinel - Security Audit JSON Exporter
 * Aggregates and exports structured compliance audit reports with verdict
 * distributions and violation frequencies for regulatory review.
 */
import { EvaluationResult } from '../types.js';
export interface AuditSummary {
    totalEvaluations: number;
    allowedCount: number;
    blockedCount: number;
    redactedCount: number;
    confirmCount: number;
    violationFrequency: Record<string, number>;
}
export declare class SecurityAuditJsonExporter {
    static generateSummary(results: EvaluationResult[]): AuditSummary;
    static exportJson(results: EvaluationResult[]): string;
}
//# sourceMappingURL=security_audit_exporter.d.ts.map