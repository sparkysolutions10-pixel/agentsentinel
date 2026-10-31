/**
 * AgentSentinel - CLI Interactive Audit Inspector
 * Parses and filters evaluation records for command-line security inspections.
 */

import { EvaluationResult, Verdict } from '../types.js';

export interface AuditFilterOptions {
  verdict?: Verdict;
  minSeverity?: 'low' | 'medium' | 'high' | 'critical';
}

export class CliAuditInspector {
  public static filterRecords(
    records: EvaluationResult[],
    options: AuditFilterOptions = {}
  ): EvaluationResult[] {
    return records.filter(rec => {
      if (options.verdict && rec.verdict !== options.verdict) {
        return false;
      }
      if (options.minSeverity) {
        const severityRank = { low: 1, medium: 2, high: 3, critical: 4 };
        const required = severityRank[options.minSeverity];
        const hasMatchingSeverity = rec.violations.some(v => (severityRank[v.severity] || 0) >= required);
        if (!hasMatchingSeverity) {
          return false;
        }
      }
      return true;
    });
  }
}
