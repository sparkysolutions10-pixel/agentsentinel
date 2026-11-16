/**
 * Unconstrained UPDATE Without WHERE Clause Detector.
 * Intercepts and blocks dangerous table-wide updates, preventing accidental mass modifications:
 * 1. Missing WHERE clause (e.g. UPDATE accounts SET balance = 0;)
 * 2. Tautological / Always-True WHERE clauses (e.g. WHERE 1=1, WHERE 'a'='a', WHERE TRUE)
 */
import { SentinelRule } from '../types.js';
export interface UnconstrainedUpdateOptions {
    allowWithConfirm?: boolean;
    queryFieldNames?: string[];
    tableWhitelist?: string[];
}
export declare const UPDATE_STATEMENT_REGEX: RegExp;
export interface UnconstrainedUpdateDetection {
    isUnconstrained: boolean;
    targetTable?: string;
    hasWhereClause?: boolean;
    isTautologicalWhere?: boolean;
    rawStatement?: string;
}
/**
 * Evaluates whether a SQL query attempts an unconstrained mass update.
 */
export declare function detectUnconstrainedUpdate(sql: string, whitelist?: string[]): UnconstrainedUpdateDetection;
/**
 * Creates the standard SentinelRule to block unconstrained UPDATE queries.
 */
export declare function createUnconstrainedUpdateRule(options?: UnconstrainedUpdateOptions): SentinelRule;
export declare const unconstrainedUpdateRule: SentinelRule;
//# sourceMappingURL=unconstrained_update.d.ts.map