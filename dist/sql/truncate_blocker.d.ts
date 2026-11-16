/**
 * Mass Table TRUNCATE Query Blocker.
 * Intercepts and blocks TRUNCATE TABLE operations across PostgreSQL, MySQL,
 * and SQLite dialects to protect against irreversible table wipes.
 */
import { SentinelRule } from '../types.js';
export interface TruncateBlockerOptions {
    allowWithConfirm?: boolean;
    queryFieldNames?: string[];
    tableWhitelist?: string[];
}
export declare const TRUNCATE_REGEX: RegExp;
/**
 * Detects if a SQL string attempts to TRUNCATE one or more tables.
 */
export declare function detectTruncateQuery(sql: string, whitelist?: string[]): {
    isTruncate: boolean;
    targetTables?: string[];
    rawStatement?: string;
};
/**
 * Creates the standard SentinelRule to block table TRUNCATE statements.
 */
export declare function createTruncateBlockerRule(options?: TruncateBlockerOptions): SentinelRule;
export declare const truncateBlockerRule: SentinelRule;
//# sourceMappingURL=truncate_blocker.d.ts.map