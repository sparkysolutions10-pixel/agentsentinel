import { describe, it, expect } from 'vitest';
import {
  detectStackedQuery,
  createStackedQueryGuardRule,
  stackedQueryGuardRule,
} from '../src/sql/stacked_query.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Stacked Query Detector & Guard Rule (Issue #66)', () => {
  describe('detectStackedQuery', () => {
    it('detects clean single query without stacking', () => {
      const result = detectStackedQuery('SELECT id, name FROM users WHERE active = 1');
      expect(result.isStacked).toBe(false);
      expect(result.statementCount).toBe(1);
      expect(result.hasDestructiveSubstatement).toBe(false);
      expect(result.reason).toBeUndefined();
    });

    it('detects multiple queries separated by semicolons', () => {
      const result = detectStackedQuery('SELECT 1; DROP TABLE accounts');
      expect(result.isStacked).toBe(true);
      expect(result.statementCount).toBe(2);
      expect(result.hasDestructiveSubstatement).toBe(true);
      expect(result.reason).toContain('contains 2 separate statements');
    });

    it('ignores semicolons embedded inside single-quoted strings', () => {
      const result = detectStackedQuery("SELECT * FROM logs WHERE message = 'error: connection failed; retrying'");
      expect(result.isStacked).toBe(false);
      expect(result.statementCount).toBe(1);
    });

    it('ignores semicolons embedded inside SQL comments', () => {
      const result = detectStackedQuery("-- step 1; initialization\nSELECT count(*) FROM audit_trail");
      expect(result.isStacked).toBe(false);
      expect(result.statementCount).toBe(1);
    });

    it('handles trailing semicolons gracefully without counting empty statement', () => {
      const result = detectStackedQuery('SELECT * FROM orders WHERE status = "pending";');
      expect(result.isStacked).toBe(false);
      expect(result.statementCount).toBe(1);
    });

    it('detects triple stacked queries', () => {
      const result = detectStackedQuery('SELECT 1; UPDATE users SET role="admin"; DELETE FROM audit_log;');
      expect(result.isStacked).toBe(true);
      expect(result.statementCount).toBe(3);
      expect(result.hasDestructiveSubstatement).toBe(true);
    });
  });

  describe('stackedQueryGuardRule', () => {
    it('allows safe single statement query', () => {
      const ctx: ToolCallContext = {
        toolName: 'database_query',
        params: { query: 'SELECT name FROM customers WHERE id = 42' },
      };
      const violation = stackedQueryGuardRule.evaluate(ctx);
      expect(violation).toBeNull();
    });

    it('blocks stacked query with critical severity when destructive statement is present', () => {
      const ctx: ToolCallContext = {
        toolName: 'database_query',
        params: { query: 'SELECT 1; DROP DATABASE production' },
      };
      const violation = stackedQueryGuardRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('critical');
      expect(violation?.ruleId).toBe('sql-block-stacked-queries');
      expect(violation?.reason).toContain('Stacked SQL injection intercepted');
    });

    it('blocks stacked query with high severity when non-destructive statements are stacked', () => {
      const ctx: ToolCallContext = {
        toolName: 'sql_execute',
        params: { sql: 'SELECT 1; SELECT 2' },
      };
      const violation = stackedQueryGuardRule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('high');
      expect(violation?.reason).toContain('contains 2 separate statements');
    });

    it('respects custom allowMultiStatement option', () => {
      const permissiveRule = createStackedQueryGuardRule({ allowMultiStatement: true });
      const ctx: ToolCallContext = {
        toolName: 'query_runner',
        params: { query: 'SELECT 1; SELECT 2' },
      };
      const violation = permissiveRule.evaluate(ctx);
      expect(violation).toBeNull();
    });

    it('respects custom maxAllowedStatements threshold', () => {
      const customRule = createStackedQueryGuardRule({ maxAllowedStatements: 2 });
      const allowedCtx: ToolCallContext = {
        toolName: 'query_runner',
        params: { query: 'SELECT 1; SELECT 2' },
      };
      expect(customRule.evaluate(allowedCtx)).toBeNull();

      const blockedCtx: ToolCallContext = {
        toolName: 'query_runner',
        params: { query: 'SELECT 1; SELECT 2; SELECT 3' },
      };
      expect(customRule.evaluate(blockedCtx)).not.toBeNull();
    });

    it('returns null if query field is missing or empty', () => {
      const ctx: ToolCallContext = {
        toolName: 'query_runner',
        params: { irrelevantParam: 'value' },
      };
      expect(stackedQueryGuardRule.evaluate(ctx)).toBeNull();

      const emptyCtx: ToolCallContext = {
        toolName: 'query_runner',
        params: { query: '   ' },
      };
      expect(stackedQueryGuardRule.evaluate(emptyCtx)).toBeNull();
    });
  });
});
