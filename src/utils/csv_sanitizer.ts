/**
 * AgentSentinel - CSV Sanitizer Utility
 * Sanitizes spreadsheet export fields against CSV / formula injection (CWE-1236).
 */

export class CsvSanitizer {
  private static readonly INJECTION_PREFIXES = ['=', '+', '-', '@', '\t', '\r'];

  public static sanitizeCell(cell: string): string {
    if (typeof cell !== 'string') return String(cell ?? '');
    const trimmed = cell.trimStart();
    if (this.INJECTION_PREFIXES.some(p => trimmed.startsWith(p))) {
      return "'" + cell;
    }
    return cell;
  }

  public static sanitizeRow(cells: string[]): string[] {
    return cells.map(c => this.sanitizeCell(c));
  }
}
