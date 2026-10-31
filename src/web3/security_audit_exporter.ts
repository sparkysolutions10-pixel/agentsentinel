/**
 * AgentSentinel - Security Audit JSON Exporter
 * Aggregates and exports structured compliance audit reports with verdict
 * distributions and violation frequencies for regulatory review.
 */

import { EvaluationResult, Verdict } from '../types.js';

export interface AuditSummary {
  totalEvaluations: number;
  allowedCount: number;
  blockedCount: number;
  redactedCount: number;
  confirmCount: number;
  violationFrequency: Record<string, number>;
}

export class SecurityAuditJsonExporter {
  public static generateSummary(results: EvaluationResult[]): AuditSummary {
    let allowed = 0;
    let blocked = 0;
    let redacted = 0;
    let confirm = 0;
    const freq: Record<string, number> = {};

    for (const res of results) {
      if (res.verdict === Verdict.ALLOW) allowed++;
      else if (res.verdict === Verdict.BLOCK) blocked++;
      else if (res.verdict === Verdict.REDACT) redacted++;
      else if (res.verdict === Verdict.CONFIRM) confirm++;

      for (const v of res.violations) {
        freq[v.ruleId] = (freq[v.ruleId] || 0) + 1;
      }
    }

    return {
      totalEvaluations: results.length,
      allowedCount: allowed,
      blockedCount: blocked,
      redactedCount: redacted,
      confirmCount: confirm,
      violationFrequency: freq
    };
  }

  public static exportJson(results: EvaluationResult[]): string {
    return JSON.stringify(this.generateSummary(results), null, 2);
  }
}
