/**
 * SarifReportFormatter - OASIS SARIF v2.1.0 output generator for security scan findings.
 */
export interface SarifViolationInput {
    ruleId: string;
    ruleName: string;
    message: string;
    level: 'error' | 'warning' | 'note';
    uri?: string;
    startLine?: number;
}
export declare class SarifReportFormatter {
    static format(violations: SarifViolationInput[], toolName?: string, toolVersion?: string): object;
}
//# sourceMappingURL=sarif_report_formatter.d.ts.map