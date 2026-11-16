/**
 * CsvAuditLogFormatter - Multi-format CSV exporter strictly conforming to UX Rule 5.
 */
export class CsvAuditLogFormatter {
    static UTF8_BOM = '\uFEFF';
    static format(records) {
        const headers = ['S.No.', 'Timestamp', 'Tool', 'Verdict', 'Reason'];
        const lines = [headers.join(',')];
        records.forEach((rec, idx) => {
            const escape = (val) => `"${val.replace(/"/g, '""')}"`;
            lines.push([
                idx + 1,
                escape(rec.timestamp),
                escape(rec.toolName),
                escape(rec.verdict),
                escape(rec.reason)
            ].join(','));
        });
        return this.UTF8_BOM + lines.join('\n');
    }
}
//# sourceMappingURL=csv_audit_log_formatter.js.map