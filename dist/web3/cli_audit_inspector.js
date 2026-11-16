/**
 * AgentSentinel - CLI Interactive Audit Inspector
 * Parses and filters evaluation records for command-line security inspections.
 */
export class CliAuditInspector {
    static filterRecords(records, options = {}) {
        return records.filter(rec => {
            if (options.verdict && rec.verdict !== options.verdict) {
                return false;
            }
            if (options.minSeverity) {
                const severityRank = { low: 1, medium: 2, high: 3, critical: 4 };
                const required = severityRank[options.minSeverity];
                const hasMatchingSeverity = rec.violations.some(v => (severityRank[v.severity] || 0) >= required);
                if (!hasMatchingSeverity) {
                    return false;
                }
            }
            return true;
        });
    }
}
//# sourceMappingURL=cli_audit_inspector.js.map