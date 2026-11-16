/**
 * SQL Dialect Configuration and System Catalog Protection Guard.
 * Provides dialect-aware rule evaluation and protects built-in system tables
 * across PostgreSQL, MySQL, SQLite, and ANSI SQL.
 */
import { SentinelRule } from '../types.js';
export type SqlDialect = 'generic' | 'postgresql' | 'mysql' | 'sqlite';
export interface DialectCatalogDefinition {
    systemSchemas: string[];
    systemTables: string[];
    sensitiveAuthTables: string[];
}
export declare const DIALECT_SYSTEM_CATALOGS: Record<SqlDialect, DialectCatalogDefinition>;
export interface SystemCatalogInspection {
    isSystemCatalog: boolean;
    isSensitiveAuth: boolean;
    detectedDialect: SqlDialect;
    matchedEntity?: string;
    reason?: string;
}
/**
 * Checks if a table or schema identifier matches known system catalogs.
 * Evaluates sensitive credential/privilege catalogs first to prevent schema overshadowing.
 */
export declare function inspectTableIdentifier(rawIdentifier: string, configuredDialect?: SqlDialect): SystemCatalogInspection;
export interface SystemCatalogGuardOptions {
    dialect?: SqlDialect;
    blockSystemCatalogModifications?: boolean;
    blockSensitiveAuthReads?: boolean;
    blockAllCatalogReads?: boolean;
    queryFieldNames?: string[];
}
/**
 * Creates SentinelRule to guard system catalog tables and dialect-specific internals.
 */
export declare function createSystemCatalogGuardRule(options?: SystemCatalogGuardOptions): SentinelRule;
export declare const systemCatalogGuardRule: SentinelRule;
//# sourceMappingURL=dialect.d.ts.map