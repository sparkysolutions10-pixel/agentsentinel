/**
 * AgentSentinel - CSV Sanitizer Utility
 * Sanitizes spreadsheet export fields against CSV / formula injection (CWE-1236).
 */
export class CsvSanitizer {
    static INJECTION_PREFIXES = ['=', '+', '-', '@', '\t', '\r'];
    static sanitizeCell(cell) {
        if (typeof cell !== 'string')
            return String(cell ?? '');
        const trimmed = cell.trimStart();
        if (this.INJECTION_PREFIXES.some(p => trimmed.startsWith(p))) {
            return "'" + cell;
        }
        return cell;
    }
    static sanitizeRow(cells) {
        return cells.map(c => this.sanitizeCell(c));
    }
}
//# sourceMappingURL=csv_sanitizer.js.map