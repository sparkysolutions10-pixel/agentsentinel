import { describe, it, expect } from 'vitest';
import {
  detectUnconstrainedDelete,
  unconstrainedDeleteRule,
} from '../src/sql/unconstrained_delete.js';
import { Verdict } from '../src/types.js';

describe('Unconstrained DELETE Tautology Detection (#63)', () => {
  describe('Tautological WHERE Condition Signatures', () => {
    it('blocks WHERE 1=1 with varying spaces', () => {
      const cases = [
        'DELETE FROM users WHERE 1=1;',
        'DELETE FROM users WHERE 1 = 1;',
        'DELETE FROM users WHERE  1   =   1 ;',
      ];
      for (const sql of cases) {
        const res = detectUnconstrainedDelete(sql);
        expect(res.isUnconstrained).toBe(true);
        expect(res.isTautologicalWhere).toBe(true);
      }
    });

    it('blocks WHERE 0=0 tautology', () => {
      const res = detectUnconstrainedDelete('DELETE FROM accounts WHERE 0=0;');
      expect(res.isUnconstrained).toBe(true);
      expect(res.isTautologicalWhere).toBe(true);
    });

    it('blocks string equality tautology (WHERE "a"="a", WHERE "admin"="admin")', () => {
      const res1 = detectUnconstrainedDelete("DELETE FROM orders WHERE 'a'='a';");
      expect(res1.isUnconstrained).toBe(true);
      expect(res1.isTautologicalWhere).toBe(true);

      const res2 = detectUnconstrainedDelete('DELETE FROM logs WHERE "test"="test";');
      expect(res2.isUnconstrained).toBe(true);
      expect(res2.isTautologicalWhere).toBe(true);
    });

    it('blocks boolean literals (WHERE TRUE, WHERE true)', () => {
      const res = detectUnconstrainedDelete('DELETE FROM sessions WHERE true;');
      expect(res.isUnconstrained).toBe(true);
      expect(res.isTautologicalWhere).toBe(true);
    });

    it('blocks NULL IS NULL tautology', () => {
      const res = detectUnconstrainedDelete('DELETE FROM metrics WHERE NULL IS NULL;');
      expect(res.isUnconstrained).toBe(true);
      expect(res.isTautologicalWhere).toBe(true);
    });
  });

  describe('Bounded vs Unbounded Discrimination', () => {
    it('permits specific equality filters (WHERE id = 5)', () => {
      const res = detectUnconstrainedDelete('DELETE FROM users WHERE id = 5;');
      expect(res.isUnconstrained).toBe(false);
    });

    it('permits range and date filters (WHERE created_at < NOW())', () => {
      const res = detectUnconstrainedDelete('DELETE FROM logs WHERE created_at < "2026-01-01";');
      expect(res.isUnconstrained).toBe(false);
    });

    it('permits parameterized queries (WHERE user_id = ?)', () => {
      const res = detectUnconstrainedDelete('DELETE FROM tokens WHERE user_id = ?;');
      expect(res.isUnconstrained).toBe(false);
    });
  });

  describe('SentinelRule evaluation', () => {
    it('returns BLOCK verdict with critical severity for WHERE 1=1', () => {
      const violation = unconstrainedDeleteRule.evaluate({
        id: 'eval-tautology-rule',
        toolName: 'execute_sql',
        params: { query: 'DELETE FROM customers WHERE 1 = 1;' },
        timestamp: Date.now(),
      });

      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('critical');
      expect(violation?.reason).toContain('tautological always-true WHERE clause detected');
    });
  });
});
