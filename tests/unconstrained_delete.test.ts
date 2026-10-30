import { describe, it, expect } from 'vitest';
import {
  detectUnconstrainedDelete,
  createUnconstrainedDeleteRule,
  unconstrainedDeleteRule,
} from '../src/sql/unconstrained_delete.js';
import { SentinelEngine } from '../src/index.js';
import { Verdict } from '../src/types.js';

describe('Unconstrained DELETE Without WHERE Clause Detector (#62)', () => {
  describe('detectUnconstrainedDelete', () => {
    it('detects simple DELETE FROM without WHERE clause', () => {
      const res = detectUnconstrainedDelete('DELETE FROM users;');
      expect(res.isUnconstrained).toBe(true);
      expect(res.targetTable).toBe('users');
      expect(res.hasWhereClause).toBe(false);
    });

    it('detects DELETE without FROM keyword (MySQL/SQLite dialect)', () => {
      const res = detectUnconstrainedDelete('DELETE `sessions`;');
      expect(res.isUnconstrained).toBe(true);
      expect(res.targetTable).toBe('sessions');
    });

    it('detects DELETE with tautological WHERE 1=1', () => {
      const res = detectUnconstrainedDelete('DELETE FROM accounts WHERE 1=1;');
      expect(res.isUnconstrained).toBe(true);
      expect(res.isTautologicalWhere).toBe(true);
      expect(res.targetTable).toBe('accounts');
    });

    it('detects DELETE with tautological WHERE TRUE', () => {
      const res = detectUnconstrainedDelete('DELETE FROM orders WHERE TRUE;');
      expect(res.isUnconstrained).toBe(true);
      expect(res.isTautologicalWhere).toBe(true);
    });

    it('allows bounded DELETE queries with valid WHERE clause', () => {
      const res = detectUnconstrainedDelete('DELETE FROM users WHERE id = 123;');
      expect(res.isUnconstrained).toBe(false);
    });

    it('respects table whitelist', () => {
      const res = detectUnconstrainedDelete('DELETE FROM staging_cache;', ['staging_cache']);
      expect(res.isUnconstrained).toBe(false);
    });
  });

  describe('SentinelRule evaluation', () => {
    it('blocks unconstrained DELETE with critical severity', () => {
      const violation = unconstrainedDeleteRule.evaluate({
        id: 'eval-del-block',
        toolName: 'execute_sql',
        params: { query: 'DELETE FROM customers;' },
        timestamp: Date.now(),
      });

      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('critical');
      expect(violation?.reason).toContain('Unconstrained mass DELETE blocked on [customers]');
    });

    it('returns CONFIRM when allowWithConfirm is true', () => {
      const rule = createUnconstrainedDeleteRule({ allowWithConfirm: true });
      const violation = rule.evaluate({
        id: 'eval-del-confirm',
        toolName: 'sql_tool',
        params: { sql: 'DELETE FROM audit_records WHERE 1=1;' },
        timestamp: Date.now(),
      });

      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.CONFIRM);
    });

    it('passes pipeline evaluation for bounded DELETE', async () => {
      const engine = new SentinelEngine();
      engine.registerRule(unconstrainedDeleteRule);

      const res = await engine.evaluate({
        id: 'engine-del-valid',
        toolName: 'sql_tool',
        params: { query: 'DELETE FROM logs WHERE created_at < "2025-01-01";' },
        timestamp: Date.now(),
      });

      expect(res.allowed).toBe(true);
      expect(res.verdict).toBe(Verdict.ALLOW);
    });
  });
});
