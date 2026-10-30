import { describe, it, expect } from 'vitest';
import {
  inspectTableIdentifier,
  systemCatalogGuardRule,
  createSystemCatalogGuardRule,
} from '../src/sql/dialect.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('System Catalog Query Interception Across Dialects (Issue #69)', () => {
  describe('information_schema privilege introspection', () => {
    it('flags and blocks queries targeting information_schema.user_privileges', () => {
      const ctx: ToolCallContext = {
        toolName: 'sql_query',
        params: {
          query: 'SELECT * FROM information_schema.user_privileges',
        },
      };
      const violation = systemCatalogGuardRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('critical');
      expect(violation?.reason).toContain('privilege catalog');
    });

    it('flags user_privileges with backticks in MySQL dialect', () => {
      const ctx: ToolCallContext = {
        toolName: 'sql_query',
        params: {
          query: 'SELECT * FROM `information_schema`.`user_privileges`',
        },
      };
      const violation = systemCatalogGuardRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('critical');
    });

    it('flags user_privileges with double quotes in PostgreSQL dialect', () => {
      const ctx: ToolCallContext = {
        toolName: 'sql_query',
        params: {
          query: 'SELECT grantee, privilege_type FROM "information_schema"."user_privileges"',
        },
      };
      const violation = systemCatalogGuardRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('critical');
    });

    it('flags short-form user_privileges introspection', () => {
      const ctx: ToolCallContext = {
        toolName: 'sql_query',
        params: {
          query: 'SELECT * FROM user_privileges',
        },
      };
      const violation = systemCatalogGuardRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
    });

    it('flags information_schema.table_privileges and schema_privileges', () => {
      const tblCtx: ToolCallContext = {
        toolName: 'sql_query',
        params: { query: 'SELECT * FROM information_schema.table_privileges' },
      };
      expect(systemCatalogGuardRule.evaluate(tblCtx)?.verdict).toBe(Verdict.BLOCK);

      const schemaCtx: ToolCallContext = {
        toolName: 'sql_query',
        params: { query: 'SELECT * FROM information_schema.schema_privileges' },
      };
      expect(systemCatalogGuardRule.evaluate(schemaCtx)?.verdict).toBe(Verdict.BLOCK);
    });
  });

  describe('Cross-dialect privilege and auth catalog protection', () => {
    it('blocks MySQL global_grants introspection', () => {
      const ctx: ToolCallContext = {
        toolName: 'sql_query',
        params: { query: 'SELECT * FROM mysql.global_grants' },
      };
      const violation = systemCatalogGuardRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
    });

    it('blocks PostgreSQL pg_roles and pg_authid introspection', () => {
      const rolesCtx: ToolCallContext = {
        toolName: 'sql_query',
        params: { query: 'SELECT rolname, rolpassword FROM pg_roles' },
      };
      expect(systemCatalogGuardRule.evaluate(rolesCtx)?.verdict).toBe(Verdict.BLOCK);

      const authCtx: ToolCallContext = {
        toolName: 'sql_query',
        params: { query: 'SELECT * FROM pg_authid' },
      };
      expect(systemCatalogGuardRule.evaluate(authCtx)?.verdict).toBe(Verdict.BLOCK);
    });

    it('blocks SQLite sqlite_master deletion/tampering', () => {
      const ctx: ToolCallContext = {
        toolName: 'sql_query',
        params: { query: 'DELETE FROM sqlite_master WHERE type="table"' },
      };
      const violation = systemCatalogGuardRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('critical');
    });

    it('allows benign business queries with similar words', () => {
      const ctx: ToolCallContext = {
        toolName: 'sql_query',
        params: {
          query: 'SELECT privilege_name FROM role_privileges WHERE role_id = 5',
        },
      };
      expect(systemCatalogGuardRule.evaluate(ctx)).toBeNull();
    });
  });
});
