/**
 * Unconstrained DELETE Without WHERE Clause Detector.
 * Intercepts and blocks dangerous table-wide mass deletions, including:
 * 1. Missing WHERE clause (e.g. DELETE FROM users;)
 * 2. Tautological / Always-True WHERE clauses (e.g. WHERE 1=1, WHERE 'a'='a', WHERE TRUE)
 */
import { SentinelRule } from '../types.js';
export interface UnconstrainedDeleteOptions {
    allowWithConfirm?: boolean;
    queryFieldNames?: string[];
    tableWhitelist?: string[];
}
export declare const DELETE_STATEMENT_REGEX: RegExp;
export declare const TAUTOLOGY_REGEXES: RegExp[];
export interface UnconstrainedDeleteDetection {
    isUnconstrained: boolean;
    targetTable?: string;
    hasWhereClause?: boolean;
    isTautologicalWhere?: boolean;
    rawStatement?: string;
}
/**
 * Evaluates whether a SQL query attempts an unconstrained mass deletion.
 */
export declare function detectUnconstrainedDelete(sql: string, whitelist?: string[]): UnconstrainedDeleteDetection;
/**
 * Creates the standard SentinelRule to block unconstrained DELETE queries.
 */
export declare function createUnconstrainedDeleteRule(options?: UnconstrainedDeleteOptions): SentinelRule;
export declare const unconstrainedDeleteRule: SentinelRule;
//# sourceMappingURL=unconstrained_delete.d.ts.map