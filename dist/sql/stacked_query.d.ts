/**
 * Stacked Query and Multi-Statement SQL Injection Guard.
 * Detects and blocks unauthorized semicolon-delimited multiple statements
 * in single-query parameters (e.g. `SELECT 1; DROP TABLE users;`).
 */
import { SentinelRule } from '../types.js';
export interface StackedQueryGuardOptions {
    allowMultiStatement?: boolean;
    queryFieldNames?: string[];
    maxAllowedStatements?: number;
}
export interface StackedQueryDetection {
    isStacked: boolean;
    statementCount: number;
    statements: string[];
    hasDestructiveSubstatement: boolean;
    reason?: string;
}
/**
 * Detects whether a SQL query string contains stacked multi-statements.
 */
export declare function detectStackedQuery(sql: string, maxAllowed?: number): StackedQueryDetection;
/**
 * Creates the standard SentinelRule to guard against stacked SQL queries.
 */
export declare function createStackedQueryGuardRule(options?: StackedQueryGuardOptions): SentinelRule;
export declare const stackedQueryGuardRule: SentinelRule;
//# sourceMappingURL=stacked_query.d.ts.map