import { describe, it, expect } from 'vitest';
import { CsvAuditLogFormatter } from '../src/utils/csv_audit_log_formatter.js';

describe('CsvAuditLogFormatter', () => {
  it('formats audit records with UTF-8 BOM and sequential S.No.', () => {
    const records = [
      { timestamp: '2026-10-31', toolName: 'sql_query', verdict: 'ALLOWED', reason: 'Safe query' }
    ];
    const csv = CsvAuditLogFormatter.format(records);

    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('S.No.,Timestamp,Tool,Verdict,Reason');
    expect(csv).toContain('1,"2026-10-31","sql_query","ALLOWED","Safe query"');
  });
});
