/**
 * CsvAuditLogFormatter - Multi-format CSV exporter strictly conforming to UX Rule 5.
 */

export interface AuditRecord {
  timestamp: string;
  toolName: string;
  verdict: string;
  reason: string;
}

export class CsvAuditLogFormatter {
  public static readonly UTF8_BOM = '\uFEFF';

  public static format(records: AuditRecord[]): string {
    const headers = ['S.No.', 'Timestamp', 'Tool', 'Verdict', 'Reason'];
    const lines = [headers.join(',')];

    records.forEach((rec, idx) => {
      const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;
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
