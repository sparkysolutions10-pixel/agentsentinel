/**
 * AgentSentinel - Enterprise Compliance Report Generator
 * Formats structured Markdown executive reports detailing zero-trust
 * blockchain security posture, active rule counts, and policy coverage.
 */
export interface ComplianceReportInput {
    organizationName: string;
    environment: string;
    totalActiveRules: number;
    totalEvaluations: number;
    totalBlocks: number;
}
export declare class EnterpriseComplianceReportGenerator {
    static generateMarkdown(input: ComplianceReportInput): string;
}
//# sourceMappingURL=enterprise_compliance_report.d.ts.map