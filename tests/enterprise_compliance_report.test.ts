import { describe, it, expect } from 'vitest';
import { EnterpriseComplianceReportGenerator } from '../src/web3/enterprise_compliance_report.js';

describe('EnterpriseComplianceReportGenerator', () => {
  it('generates formatted Markdown report with accurate summary metrics', () => {
    const report = EnterpriseComplianceReportGenerator.generateMarkdown({
      organizationName: 'Global FinTech DAO',
      environment: 'Stellar Mainnet',
      totalActiveRules: 100,
      totalEvaluations: 50000,
      totalBlocks: 42
    });

    expect(report).toContain('# AgentSentinel Executive Security Compliance Report');
    expect(report).toContain('Global FinTech DAO');
    expect(report).toContain('Total Active Security Rules:** 100');
  });
});
