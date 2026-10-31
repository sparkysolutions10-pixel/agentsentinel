import { describe, it, expect } from 'vitest';
import { SarifReportFormatter } from '../src/utils/sarif_report_formatter.js';

describe('SarifReportFormatter', () => {
  it('generates standard SARIF v2.1.0 document', () => {
    const report = SarifReportFormatter.format([
      {
        ruleId: 'SEC001',
        ruleName: 'ShellInjectionBlocked',
        message: 'Unauthorized shell command execution',
        level: 'error',
        uri: 'workspace/agent.ts',
        startLine: 42
      }
    ]) as any;

    expect(report.version).toBe('2.1.0');
    expect(report.runs[0].tool.driver.name).toBe('AgentSentinel');
    expect(report.runs[0].results[0].ruleId).toBe('SEC001');
    expect(report.runs[0].results[0].level).toBe('error');
    expect(report.runs[0].results[0].locations[0].physicalLocation.artifactLocation.uri).toBe('workspace/agent.ts');
  });
});
