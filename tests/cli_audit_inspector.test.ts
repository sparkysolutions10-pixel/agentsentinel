import { describe, it, expect } from 'vitest';
import { CliAuditInspector } from '../src/web3/cli_audit_inspector.js';
import { Verdict } from '../src/types.js';

describe('CliAuditInspector', () => {
  it('filters evaluation records by verdict and severity', () => {
    const records = [
      { verdict: Verdict.ALLOW, allowed: true, violations: [] },
      { verdict: Verdict.BLOCK, allowed: false, violations: [{ ruleId: 'r1', ruleName: 'R1', severity: 'high' as const, verdict: Verdict.BLOCK, reason: 'test' }] },
      { verdict: Verdict.BLOCK, allowed: false, violations: [{ ruleId: 'r2', ruleName: 'R2', severity: 'critical' as const, verdict: Verdict.BLOCK, reason: 'test' }] }
    ];

    const criticalOnly = CliAuditInspector.filterRecords(records, { minSeverity: 'critical' });
    expect(criticalOnly.length).toBe(1);
    expect(criticalOnly[0].violations[0].ruleId).toBe('r2');
  });
});
