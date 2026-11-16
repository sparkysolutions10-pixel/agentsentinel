/**
 * AgentSentinel - CLI Interactive Audit Inspector
 * Parses and filters evaluation records for command-line security inspections.
 */
import { EvaluationResult, Verdict } from '../types.js';
export interface AuditFilterOptions {
    verdict?: Verdict;
    minSeverity?: 'low' | 'medium' | 'high' | 'critical';
}
export declare class CliAuditInspector {
    static filterRecords(records: EvaluationResult[], options?: AuditFilterOptions): EvaluationResult[];
}
//# sourceMappingURL=cli_audit_inspector.d.ts.map