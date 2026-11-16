/**
 * Destructive DDL Blocker.
 * Intercepts and blocks DROP TABLE, DROP DATABASE, and DROP SCHEMA statements
 * to prevent catastrophic data loss in database tool calls.
 * Supports requiring human confirmation or strictly blocking DDL drops.
 */
import { SentinelRule } from '../types.js';
export interface DestructiveDdlOptions {
    allowWithConfirm?: boolean;
    blockedObjects?: ('TABLE' | 'DATABASE' | 'SCHEMA' | 'VIEW')[];
    queryFieldNames?: string[];
}
export declare const DEFAULT_SQL_QUERY_FIELDS: string[];
export declare const DROP_DDL_REGEX: RegExp;
/**
 * Strips single-quoted string literals to prevent false positives when keywords appear inside text data.
 */
export declare function stripSingleQuotedLiterals(sql: string): string;
/**
 * Detects if a SQL query string contains a destructive DROP statement.
 */
export declare function detectDestructiveDdl(sql: string, blockedObjects?: string[]): {
    isDestructive: boolean;
    objectType?: string;
    targetName?: string;
    rawStatement?: string;
};
/**
 * Creates the standard SentinelRule to block destructive DDL operations.
 */
export declare function createDestructiveDdlRule(options?: DestructiveDdlOptions): SentinelRule;
export declare const destructiveDdlRule: SentinelRule;
//# sourceMappingURL=destructive_ddl.d.ts.map