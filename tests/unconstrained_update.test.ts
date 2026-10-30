import { describe, it, expect } from 'vitest';
import {
  detectUnconstrainedUpdate,
  createUnconstrainedUpdateRule,
  unconstrainedUpdateRule,
} from '../src/sql/unconstrained_update.js';
import { SentinelEngine } from '../src/index.js';
import { Verdict } from '../src/types.js';

describe('Unconstrained UPDATE Without WHERE Clause Detector (#64)', () => {
  describe('detectUnconstrainedUpdate', () => {
    it('detects simple UPDATE without WHERE clause', () => {
      const res = detectUnconstrainedUpdate('UPDATE accounts SET balance = 0;');
      expect(res.isUnconstrained).toBe(true);
      expect(res.targetTable).toBe('accounts');
      expect(res.hasWhereClause).toBe(false);
    });

    it('detects UPDATE with tautological WHERE 1=1', () => {
      const res = detectUnconstrainedUpdate('UPDATE users SET role = "admin" WHERE 1=1;');
      expect(res.isUnconstrained).toBe(true);
      expect(res.isTautologicalWhere).toBe(true);
      expect(res.targetTable).toBe('users');
    });

    it('detects UPDATE with tautological WHERE TRUE', () => {
      const res = detectUnconstrainedUpdate('UPDATE orders SET status = "cancelled" WHERE TRUE;');
      expect(res.isUnconstrained).toBe(true);
      expect(res.isTautologicalWhere).toBe(true);
    });

    it('allows bounded UPDATE queries with genuine WHERE condition', () => {
      const res = detectUnconstrainedUpdate('UPDATE accounts SET balance = balance + 100 WHERE id = 42;');
      expect(res.isUnconstrained).toBe(false);
    });

    it('respects table whitelist', () => {
      const res = detectUnconstrainedUpdate('UPDATE session_metrics SET hits = 0;', ['session_metrics']);
      expect(res.isUnconstrained).toBe(false);
    });
  });

  describe('SentinelRule evaluation', () => {
    it('blocks unconstrained UPDATE with critical severity', () => {
      const violation = unconstrainedUpdateRule.evaluate({
        id: 'eval-upd-block',
        toolName: 'execute_sql',
        params: { query: 'UPDATE profiles SET bio = "cleared";' },
        timestamp: Date.now(),
      });

      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('critical');
      expect(violation?.reason).toContain('Unconstrained mass UPDATE blocked on [profiles]');
    });

    it('returns CONFIRM when allowWithConfirm is true', () => {
      const confirmRule = createUnconstrainedUpdateRule({ allowWithConfirm: true });
      const violation = confirmRule.evaluate({
        id: 'eval-upd-confirm',
        toolName: 'sql_tool',
        params: { sql: 'UPDATE products SET price = 9.99;' },
        timestamp: Date.now(),
      });

      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.CONFIRM);
    });

    it('SentinelEngine passes pipeline evaluation for bounded UPDATE', async () => {
      const engine = new SentinelEngine();
      engine.registerRule(unconstrainedUpdateRule);

      const res = await engine.evaluate({
        id: 'engine-upd-valid',
        toolName: 'sql_tool',
        params: { query: 'UPDATE users SET active = 1 WHERE user_id = 99;' },
        timestamp: Date.now(),
      });

      expect(res.allowed).toBe(true);
      expect(res.verdict).toBe(Verdict.ALLOW);
    });
  });
});
