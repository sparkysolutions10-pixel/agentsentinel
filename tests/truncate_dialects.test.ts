import { describe, it, expect } from 'vitest';
import {
  detectTruncateQuery,
  truncateBlockerRule,
} from '../src/sql/truncate_blocker.js';
import { Verdict } from '../src/types.js';

describe('TRUNCATE Blocker Dialect Variations (#61)', () => {
  describe('PostgreSQL Dialect Variations', () => {
    it('detects TRUNCATE with RESTART IDENTITY and CASCADE', () => {
      const sql = 'TRUNCATE TABLE orders RESTART IDENTITY CASCADE;';
      const res = detectTruncateQuery(sql);
      expect(res.isTruncate).toBe(true);
      expect(res.targetTables).toEqual(['orders']);
    });

    it('detects PostgreSQL TRUNCATE ONLY with multiple tables', () => {
      const sql = 'TRUNCATE ONLY logs, sessions, metrics;';
      const res = detectTruncateQuery(sql);
      expect(res.isTruncate).toBe(true);
      expect(res.targetTables).toEqual(['logs', 'sessions', 'metrics']);
    });
  });

  describe('MySQL and MariaDB Variations', () => {
    it('detects backtick schema and table qualifiers (`schema`.`table`)', () => {
      const sql = 'TRUNCATE TABLE `production`.`users`;';
      const res = detectTruncateQuery(sql);
      expect(res.isTruncate).toBe(true);
      expect(res.targetTables).toEqual(['production.users']);
    });

    it('detects mixed case TrUnCaTe TaBlE', () => {
      const sql = 'TrUnCaTe TaBlE `cache_entries`;';
      const res = detectTruncateQuery(sql);
      expect(res.isTruncate).toBe(true);
      expect(res.targetTables).toEqual(['cache_entries']);
    });
  });

  describe('Stacked Injection and Embedded String Literal Protection', () => {
    it('detects stacked TRUNCATE behind normal SELECT query', () => {
      const sql = 'SELECT * FROM users WHERE active = 1; TRUNCATE TABLE users;';
      const res = detectTruncateQuery(sql);
      expect(res.isTruncate).toBe(true);
      expect(res.targetTables).toEqual(['users']);
    });

    it('does not block queries containing TRUNCATE inside string literals', () => {
      const sql = "SELECT * FROM audit WHERE action = 'TRUNCATE TABLE users';";
      const res = detectTruncateQuery(sql);
      expect(res.isTruncate).toBe(false);
    });

    it('rule evaluation returns BLOCK verdict with critical severity', () => {
      const violation = truncateBlockerRule.evaluate({
        id: 'eval-truncate-dialect',
        toolName: 'execute_sql',
        params: { query: 'TRUNCATE TABLE "payments";' },
        timestamp: Date.now(),
      });

      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('critical');
    });
  });
});
