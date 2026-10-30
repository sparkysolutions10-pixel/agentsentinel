import { describe, it, expect } from 'vitest';
import {
  splitSqlStatements,
  stripSqlComments,
  classifySqlQuery,
} from '../src/sql/tokenizer.js';
import {
  detectStackedQuery,
  stackedQueryGuardRule,
} from '../src/sql/stacked_query.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Stacked Query Detector with Embedded Quotes and Comments (Issue #67)', () => {
  describe('Quote boundary preservation', () => {
    it('does not split on semicolon inside standard single-quoted strings', () => {
      const sql = "SELECT * FROM config WHERE val = 'key;value;pair'";
      const stmts = splitSqlStatements(sql);
      expect(stmts).toHaveLength(1);
      expect(stmts[0]).toBe(sql);
    });

    it('does not split on semicolon inside ANSI escaped quotes (\'\')', () => {
      const sql = "SELECT * FROM audit WHERE message = 'User''s action; unauthorized access attempt'";
      const stmts = splitSqlStatements(sql);
      expect(stmts).toHaveLength(1);
      expect(stmts[0]).toContain("User''s action; unauthorized access attempt");
    });

    it('does not split on semicolon inside backslash escaped quotes (\\\')', () => {
      const sql = "SELECT * FROM logs WHERE message = 'Failed to connect; timeout\\'; retrying'";
      const stmts = splitSqlStatements(sql);
      expect(stmts).toHaveLength(1);
    });

    it('does not split on semicolon inside double-quoted identifiers', () => {
      const sql = 'SELECT * FROM "dept;sales" WHERE "code;id" = 42';
      const stmts = splitSqlStatements(sql);
      expect(stmts).toHaveLength(1);
    });

    it('does not split on semicolon inside MySQL backtick identifiers', () => {
      const sql = 'SELECT * FROM `orders;archive` WHERE `status;flag` = 1';
      const stmts = splitSqlStatements(sql);
      expect(stmts).toHaveLength(1);
    });
  });

  describe('Comment stripping and boundary handling', () => {
    it('ignores semicolons inside single-line SQL comments (--)', () => {
      const sql = "SELECT id FROM users -- ; DROP TABLE users;\nWHERE active = 1";
      const stmts = splitSqlStatements(sql);
      expect(stmts).toHaveLength(1);
      expect(detectStackedQuery(sql).isStacked).toBe(false);
    });

    it('ignores semicolons inside MySQL hash comments (#)', () => {
      const sql = "SELECT id FROM users # ; TRUNCATE TABLE users;\nWHERE active = 1";
      const stmts = splitSqlStatements(sql);
      expect(stmts).toHaveLength(1);
      expect(detectStackedQuery(sql).isStacked).toBe(false);
    });

    it('ignores semicolons inside multi-line block comments (/* ... */)', () => {
      const sql = "SELECT name FROM employees /* ; DROP DATABASE prod; */ WHERE dept = 'HR'";
      const stmts = splitSqlStatements(sql);
      expect(stmts).toHaveLength(1);
      expect(detectStackedQuery(sql).isStacked).toBe(false);
    });

    it('correctly extracts stacked queries interspersed with comments', () => {
      const sql = `
        SELECT * FROM users WHERE id = 1;
        -- comment between queries
        DROP TABLE users;
      `;
      const stmts = splitSqlStatements(sql);
      expect(stmts).toHaveLength(2);
      expect(stmts[0]).toBe('SELECT * FROM users WHERE id = 1');
      expect(stmts[1]).toBe('DROP TABLE users');

      const detection = detectStackedQuery(sql);
      expect(detection.isStacked).toBe(true);
      expect(detection.hasDestructiveSubstatement).toBe(true);
    });

    it('detects stacked queries obfuscated with inline comments inside statements', () => {
      const sql = 'SELECT 1; /**/ DROP /*comment*/ TABLE accounts;';
      const stmts = splitSqlStatements(sql);
      expect(stmts).toHaveLength(2);

      const detection = detectStackedQuery(sql);
      expect(detection.isStacked).toBe(true);
      expect(detection.hasDestructiveSubstatement).toBe(true);
    });
  });

  describe('Sentinel Rule enforcement against obfuscated stacked queries', () => {
    it('blocks stacked query containing comments and DROP TABLE with critical severity', () => {
      const ctx: ToolCallContext = {
        toolName: 'sql_client',
        params: {
          query: "SELECT id FROM accounts WHERE name = 'test'; /* injection */ DROP TABLE audit_log;",
        },
      };
      const violation = stackedQueryGuardRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('critical');
      expect(violation?.reason).toContain('Stacked SQL injection intercepted');
    });

    it('allows queries with multiple semicolons in string literals without false positives', () => {
      const ctx: ToolCallContext = {
        toolName: 'sql_client',
        params: {
          query: "INSERT INTO log (entry) VALUES ('cmd: select 1; drop table foo; -- safe string')",
        },
      };
      const violation = stackedQueryGuardRule.evaluate(ctx);
      expect(violation).toBeNull();
    });
  });
});
