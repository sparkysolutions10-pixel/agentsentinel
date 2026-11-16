/**
 * AgentSentinel - Security Audit JSON Exporter
 * Aggregates and exports structured compliance audit reports with verdict
 * distributions and violation frequencies for regulatory review.
 */
import { Verdict } from '../types.js';
export class SecurityAuditJsonExporter {
    static generateSummary(results) {
        let allowed = 0;
        let blocked = 0;
        let redacted = 0;
        let confirm = 0;
        const freq = {};
        for (const res of results) {
            if (res.verdict === Verdict.ALLOW)
                allowed++;
            else if (res.verdict === Verdict.BLOCK)
                blocked++;
            else if (res.verdict === Verdict.REDACT)
                redacted++;
            else if (res.verdict === Verdict.CONFIRM)
                confirm++;
            for (const v of res.violations) {
                freq[v.ruleId] = (freq[v.ruleId] || 0) + 1;
            }
        }
        return {
            totalEvaluations: results.length,
            allowedCount: allowed,
            blockedCount: blocked,
            redactedCount: redacted,
            confirmCount: confirm,
            violationFrequency: freq
        };
    }
    static exportJson(results) {
        return JSON.stringify(this.generateSummary(results), null, 2);
    }
}
//# sourceMappingURL=security_audit_exporter.js.map