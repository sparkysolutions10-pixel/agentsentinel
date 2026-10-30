import { describe, it, expect } from 'vitest';
import {
  inspectTableIdentifier,
  createSystemCatalogGuardRule,
  systemCatalogGuardRule,
  DIALECT_SYSTEM_CATALOGS,
  SqlDialect,
} from '../src/sql/dialect.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('SQL Dialect Configuration & System Catalog Guard (Issue #68)', () => {
  describe('Dialect catalog definitions', () => {
    it('contains catalogs for postgresql, mysql, and sqlite', () => {
      expect(DIALECT_SYSTEM_CATALOGS.postgresql.systemSchemas).toContain('pg_catalog');
      expect(DIALECT_SYSTEM_CATALOGS.mysql.systemSchemas).toContain('information_schema');
      expect(DIALECT_SYSTEM_CATALOGS.sqlite.systemTables).toContain('sqlite_master');
      expect(DIALECT_SYSTEM_CATALOGS.postgresql.sensitiveAuthTables).toContain('pg_shadow');
    });
  });

  describe('inspectTableIdentifier', () => {
    it('identifies SQLite system tables with or without quotes', () => {
      expect(inspectTableIdentifier('sqlite_master', 'sqlite').isSystemCatalog).toBe(true);
      expect(inspectTableIdentifier('"sqlite_schema"', 'sqlite').isSystemCatalog).toBe(true);
      expect(inspectTableIdentifier('`sqlite_sequence`', 'sqlite').isSystemCatalog).toBe(true);
    });

    it('identifies PostgreSQL pg_catalog schemas and sensitive tables', () => {
      const cat = inspectTableIdentifier('pg_catalog.pg_tables', 'postgresql');
      expect(cat.isSystemCatalog).toBe(true);
      expect(cat.isSensitiveAuth).toBe(false);

      const auth = inspectTableIdentifier('pg_shadow', 'postgresql');
      expect(auth.isSystemCatalog).toBe(true);
      expect(auth.isSensitiveAuth).toBe(true);
    });

    it('identifies MySQL user credential catalogs', () => {
      const mysqlUser = inspectTableIdentifier('mysql.user', 'mysql');
      expect(mysqlUser.isSystemCatalog).toBe(true);
      expect(mysqlUser.isSensitiveAuth).toBe(true);
    });

    it('returns false for regular application tables', () => {
      expect(inspectTableIdentifier('customers').isSystemCatalog).toBe(false);
      expect(inspectTableIdentifier('app_users').isSystemCatalog).toBe(false);
      expect(inspectTableIdentifier('sales.daily_report').isSystemCatalog).toBe(false);
    });
  });

  describe('createSystemCatalogGuardRule', () => {
    it('blocks DROP or ALTER on system tables with critical severity', () => {
      const ctx: ToolCallContext = {
        toolName: 'execute_sql',
        params: { query: 'DROP TABLE sqlite_master' },
      };
      const violation = systemCatalogGuardRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('critical');
      expect(violation?.reason).toContain('Unauthorized modification of system catalog');
    });

    it('blocks DELETE modifications on pg_catalog', () => {
      const ctx: ToolCallContext = {
        toolName: 'execute_sql',
        params: { query: 'DELETE FROM pg_catalog.pg_tables WHERE tablename = "secret"' },
      };
      const violation = systemCatalogGuardRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('critical');
    });

    it('blocks read of sensitive credential table pg_shadow by default', () => {
      const ctx: ToolCallContext = {
        toolName: 'execute_sql',
        params: { query: 'SELECT usename, passwd FROM pg_shadow' },
      };
      const violation = systemCatalogGuardRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('critical');
      expect(violation?.reason).toContain('credential/authentication catalog intercepted');
    });

    it('blocks read of mysql.user credential table', () => {
      const ctx: ToolCallContext = {
        toolName: 'db_query',
        params: { query: 'SELECT Host, User, authentication_string FROM mysql.user' },
      };
      const violation = systemCatalogGuardRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('critical');
    });

    it('allows benign reads of sqlite_master when blockAllCatalogReads is false', () => {
      const ctx: ToolCallContext = {
        toolName: 'db_query',
        params: { query: 'SELECT name FROM sqlite_master WHERE type="table"' },
      };
      const violation = systemCatalogGuardRule.evaluate(ctx);
      expect(violation).toBeNull();
    });

    it('blocks all catalog reads if blockAllCatalogReads is strictly enabled', () => {
      const strictRule = createSystemCatalogGuardRule({ blockAllCatalogReads: true });
      const ctx: ToolCallContext = {
        toolName: 'db_query',
        params: { query: 'SELECT name FROM sqlite_master' },
      };
      const violation = strictRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('high');
      expect(violation?.reason).toContain('System catalog reconnaissance query blocked');
    });

    it('allows queries against standard business tables', () => {
      const ctx: ToolCallContext = {
        toolName: 'db_query',
        params: { query: 'SELECT id, title, price FROM products WHERE in_stock = 1' },
      };
      expect(systemCatalogGuardRule.evaluate(ctx)).toBeNull();
    });
  });
});
