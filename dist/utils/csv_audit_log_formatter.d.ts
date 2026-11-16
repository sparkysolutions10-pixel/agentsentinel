/**
 * CsvAuditLogFormatter - Multi-format CSV exporter strictly conforming to UX Rule 5.
 */
export interface AuditRecord {
    timestamp: string;
    toolName: string;
    verdict: string;
    reason: string;
}
export declare class CsvAuditLogFormatter {
    static readonly UTF8_BOM = "\uFEFF";
    static format(records: AuditRecord[]): string;
}
//# sourceMappingURL=csv_audit_log_formatter.d.ts.map