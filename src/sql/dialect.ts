/**
 * SQL Dialect Configuration and System Catalog Protection Guard.
 * Provides dialect-aware rule evaluation and protects built-in system tables
 * across PostgreSQL, MySQL, SQLite, and ANSI SQL.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';
import { splitSqlStatements, classifySqlStatement, SqlCommandType } from './tokenizer.js';
import { DEFAULT_SQL_QUERY_FIELDS } from './destructive_ddl.js';

export type SqlDialect = 'generic' | 'postgresql' | 'mysql' | 'sqlite';

export interface DialectCatalogDefinition {
  systemSchemas: string[];
  systemTables: string[];
  sensitiveAuthTables: string[];
}

export const DIALECT_SYSTEM_CATALOGS: Record<SqlDialect, DialectCatalogDefinition> = {
  generic: {
    systemSchemas: ['information_schema'],
    systemTables: ['information_schema'],
    sensitiveAuthTables: [
      'information_schema.user_privileges',
      'user_privileges',
      'information_schema.table_privileges',
      'table_privileges',
      'information_schema.schema_privileges',
      'schema_privileges',
    ],
  },
  postgresql: {
    systemSchemas: ['pg_catalog', 'information_schema', 'pg_toast'],
    systemTables: [
      'pg_class',
      'pg_tables',
      'pg_database',
      'pg_proc',
      'pg_stat_activity',
      'pg_roles',
      'pg_user',
      'pg_shadow',
      'pg_authid',
      'pg_auth_members',
      'pg_settings',
    ],
    sensitiveAuthTables: [
      'pg_shadow',
      'pg_authid',
      'pg_roles',
      'pg_user',
      'information_schema.user_privileges',
      'user_privileges',
      'information_schema.table_privileges',
      'table_privileges',
      'information_schema.schema_privileges',
      'schema_privileges',
    ],
  },
  mysql: {
    systemSchemas: ['information_schema', 'mysql', 'performance_schema', 'sys'],
    systemTables: [
      'mysql.user',
      'mysql.db',
      'mysql.tables_priv',
      'mysql.columns_priv',
      'mysql.procs_priv',
      'mysql.global_grants',
    ],
    sensitiveAuthTables: [
      'mysql.user',
      'user',
      'mysql.tables_priv',
      'mysql.db',
      'mysql.global_grants',
      'information_schema.user_privileges',
      'user_privileges',
      'information_schema.table_privileges',
      'table_privileges',
      'information_schema.schema_privileges',
      'schema_privileges',
    ],
  },
  sqlite: {
    systemSchemas: [],
    systemTables: [
      'sqlite_master',
      'sqlite_schema',
      'sqlite_temp_master',
      'sqlite_temp_schema',
      'sqlite_sequence',
      'sqlite_stat1',
      'sqlite_stat4',
    ],
    sensitiveAuthTables: [],
  },
};

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
export function inspectTableIdentifier(
  rawIdentifier: string,
  configuredDialect: SqlDialect = 'generic'
): SystemCatalogInspection {
  if (!rawIdentifier) {
    return { isSystemCatalog: false, isSensitiveAuth: false, detectedDialect: configuredDialect };
  }

  // Normalize: remove quotes, backticks, brackets, and lowercase
  const normalized = rawIdentifier
    .replace(/[`"'\[\]]/g, '')
    .trim()
    .toLowerCase();

  const dialectsToCheck: SqlDialect[] =
    configuredDialect === 'generic' ? ['postgresql', 'mysql', 'sqlite', 'generic'] : [configuredDialect];

  // 1. FIRST PASS: Check ALL sensitive authentication & privilege tables across all candidate dialects
  for (const dialect of dialectsToCheck) {
    const config = DIALECT_SYSTEM_CATALOGS[dialect];
    for (const authTable of config.sensitiveAuthTables) {
      const lower = authTable.toLowerCase();
      if (
        normalized === lower ||
        normalized === lower.replace(/^information_schema\./, '') ||
        normalized.endsWith('.' + lower) ||
        normalized === 'information_schema.' + lower
      ) {
        return {
          isSystemCatalog: true,
          isSensitiveAuth: true,
          detectedDialect: dialect,
          matchedEntity: authTable,
          reason: `Access to sensitive authentication/privilege catalog '${rawIdentifier}' is restricted (${dialect})`,
        };
      }
    }
  }

  // 2. SECOND PASS: Check schemas (e.g. pg_catalog.xxx, mysql.xxx, information_schema.xxx)
  for (const dialect of dialectsToCheck) {
    const config = DIALECT_SYSTEM_CATALOGS[dialect];
    for (const schema of config.systemSchemas) {
      if (normalized === schema || normalized.startsWith(schema + '.')) {
        return {
          isSystemCatalog: true,
          isSensitiveAuth: false,
          detectedDialect: dialect,
          matchedEntity: schema,
          reason: `Target references system catalog schema '${schema}' (${dialect})`,
        };
      }
    }
  }

  // 3. THIRD PASS: Check protected system tables
  for (const dialect of dialectsToCheck) {
    const config = DIALECT_SYSTEM_CATALOGS[dialect];
    for (const table of config.systemTables) {
      const lower = table.toLowerCase();
      if (normalized === lower || normalized.endsWith('.' + lower)) {
        return {
          isSystemCatalog: true,
          isSensitiveAuth: false,
          detectedDialect: dialect,
          matchedEntity: table,
          reason: `Target references protected system catalog table '${table}' (${dialect})`,
        };
      }
    }
  }

  return {
    isSystemCatalog: false,
    isSensitiveAuth: false,
    detectedDialect: configuredDialect,
  };
}

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
export function createSystemCatalogGuardRule(options?: SystemCatalogGuardOptions): SentinelRule {
  const dialect = options?.dialect ?? 'generic';
  const blockModifications = options?.blockSystemCatalogModifications ?? true;
  const blockAuthReads = options?.blockSensitiveAuthReads ?? true;
  const blockAllReads = options?.blockAllCatalogReads ?? false;
  const queryFields = options?.queryFieldNames || DEFAULT_SQL_QUERY_FIELDS;

  return {
    id: 'sql-protect-system-catalogs',
    name: 'Guard Against Unauthorized System Catalog Access and Tampering',
    category: 'sql',
    priority: 950,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      let sqlQuery: string | null = null;
      if (ctx.params) {
        for (const field of queryFields) {
          if (typeof ctx.params[field] === 'string' && ctx.params[field].trim() !== '') {
            sqlQuery = ctx.params[field];
            break;
          }
        }
      }

      if (!sqlQuery) {
        return null;
      }

      const statements = splitSqlStatements(sqlQuery);
      for (const rawStmt of statements) {
        const stmt = classifySqlStatement(rawStmt);
        if (!stmt.targetTable) {
          // Check for direct mentions of sensitive tables in raw statement if targetTable failed to capture
          for (const pattern of [
            /pg_shadow/i,
            /pg_authid/i,
            /mysql\.user/i,
            /sqlite_master/i,
            /information_schema\.user_privileges/i,
            /information_schema\.table_privileges/i,
            /information_schema\.schema_privileges/i,
            /user_privileges/i,
            /table_privileges/i,
            /schema_privileges/i,
          ]) {
            if (pattern.test(rawStmt)) {
              stmt.targetTable = rawStmt.match(pattern)?.[0];
              break;
            }
          }
        }

        if (stmt.targetTable) {
          const inspection = inspectTableIdentifier(stmt.targetTable, dialect);
          if (inspection.isSystemCatalog) {
            const isModification =
              stmt.category === 'DDL' ||
              stmt.command === 'DELETE' ||
              stmt.command === 'UPDATE' ||
              stmt.command === 'INSERT' ||
              stmt.command === 'DROP' ||
              stmt.command === 'TRUNCATE';

            // Intercept modifications
            if (isModification && blockModifications) {
              return {
                ruleId: 'sql-protect-system-catalogs',
                ruleName: 'Guard Against Unauthorized System Catalog Access and Tampering',
                severity: 'critical',
                verdict: Verdict.BLOCK,
                reason: `Unauthorized modification of system catalog intercepted: ${inspection.reason}`,
              };
            }

            // Intercept sensitive authentication/privilege reads
            if (inspection.isSensitiveAuth && blockAuthReads) {
              return {
                ruleId: 'sql-protect-system-catalogs',
                ruleName: 'Guard Against Unauthorized System Catalog Access and Tampering',
                severity: 'critical',
                verdict: Verdict.BLOCK,
                reason: `Unauthorized read of credential/authentication catalog intercepted: ${inspection.reason}`,
              };
            }

            // Intercept all catalog reads if strictly configured
            if (blockAllReads && stmt.command === 'SELECT') {
              return {
                ruleId: 'sql-protect-system-catalogs',
                ruleName: 'Guard Against Unauthorized System Catalog Access and Tampering',
                severity: 'high',
                verdict: Verdict.BLOCK,
                reason: `System catalog reconnaissance query blocked: ${inspection.reason}`,
              };
            }
          }
        }
      }

      return null;
    },
  };
}

export const systemCatalogGuardRule: SentinelRule = createSystemCatalogGuardRule();
