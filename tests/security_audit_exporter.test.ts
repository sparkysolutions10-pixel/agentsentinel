import { describe, it, expect } from 'vitest';
import { SecurityAuditJsonExporter } from '../src/web3/security_audit_exporter.js';
import { Verdict } from '../src/types.js';

describe('SecurityAuditJsonExporter', () => {
  it('computes audit summary metrics accurately', () => {
    const results = [
      { verdict: Verdict.ALLOW, allowed: true, violations: [] },
      { verdict: Verdict.BLOCK, allowed: false, violations: [{ ruleId: 'rule_1', ruleName: 'R1', severity: 'high' as const, verdict: Verdict.BLOCK, reason: 'test' }] },
      { verdict: Verdict.BLOCK, allowed: false, violations: [{ ruleId: 'rule_1', ruleName: 'R1', severity: 'high' as const, verdict: Verdict.BLOCK, reason: 'test' }] }
    ];

    const summary = SecurityAuditJsonExporter.generateSummary(results);
    expect(summary.totalEvaluations).toBe(3);
    expect(summary.allowedCount).toBe(1);
    expect(summary.blockedCount).toBe(2);
    expect(summary.violationFrequency['rule_1']).toBe(2);
  });
});
