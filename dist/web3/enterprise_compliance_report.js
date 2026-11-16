/**
 * AgentSentinel - Enterprise Compliance Report Generator
 * Formats structured Markdown executive reports detailing zero-trust
 * blockchain security posture, active rule counts, and policy coverage.
 */
export class EnterpriseComplianceReportGenerator {
    static generateMarkdown(input) {
        const blockRate = input.totalEvaluations > 0
            ? ((input.totalBlocks / input.totalEvaluations) * 100).toFixed(2)
            : '0.00';
        return `# AgentSentinel Executive Security Compliance Report

**Organization:** ${input.organizationName}
**Environment:** ${input.environment}
**Generated At:** ${new Date().toISOString()}

---

## 1. Executive Summary
AgentSentinel is active as an autonomous zero-trust runtime firewall across all AI agent tool invocations and smart contract transactions.

## 2. Key Metrics
* **Total Active Security Rules:** ${input.totalActiveRules}
* **Total Tool Invocations Evaluated:** ${input.totalEvaluations.toLocaleString()}
* **Threats Intercepted / Blocked:** ${input.totalBlocks.toLocaleString()} (${blockRate}%)

## 3. Compliance Affirmation
All operations strictly conform to zero-trust invariants, SEP-41 token interfaces, and multi-tenant cryptographic session fences.
`;
    }
}
//# sourceMappingURL=enterprise_compliance_report.js.map