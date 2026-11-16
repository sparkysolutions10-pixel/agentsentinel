/**
 * AgentSentinel - CSV Sanitizer Utility
 * Sanitizes spreadsheet export fields against CSV / formula injection (CWE-1236).
 */
export declare class CsvSanitizer {
    private static readonly INJECTION_PREFIXES;
    static sanitizeCell(cell: string): string;
    static sanitizeRow(cells: string[]): string[];
}
//# sourceMappingURL=csv_sanitizer.d.ts.map