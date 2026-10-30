import { describe, it, expect } from 'vitest';
import {
  detectTruncateQuery,
  createTruncateBlockerRule,
  truncateBlockerRule,
} from '../src/sql/truncate_blocker.js';
import { SentinelEngine } from '../src/index.js';
import { Verdict } from '../src/types.js';

describe('Mass Table TRUNCATE Query Blocker (#60)', () => {
  describe('detectTruncateQuery detector', () => {
    it('detects TRUNCATE TABLE query', () => {
      const res = detectTruncateQuery('TRUNCATE TABLE users;');
      expect(res.isTruncate).toBe(true);
      expect(res.targetTables).toEqual(['users']);
    });

    it('detects PostgreSQL TRUNCATE without TABLE keyword', () => {
      const res = detectTruncateQuery('TRUNCATE ONLY orders CASCADE;');
      expect(res.isTruncate).toBe(true);
      expect(res.targetTables).toEqual(['orders']);
    });

    it('detects multi-table truncate (TRUNCATE tbl1, tbl2)', () => {
      const res = detectTruncateQuery('TRUNCATE TABLE accounts, audit_logs, sessions;');
      expect(res.isTruncate).toBe(true);
      expect(res.targetTables).toEqual(['accounts', 'audit_logs', 'sessions']);
    });

    it('respects table whitelist option', () => {
      const res = detectTruncateQuery('TRUNCATE TABLE temp_cache;', ['temp_cache']);
      expect(res.isTruncate).toBe(false);
    });

    it('passes standard SELECT and INSERT queries', () => {
      expect(detectTruncateQuery('SELECT * FROM users;').isTruncate).toBe(false);
      expect(detectTruncateQuery('INSERT INTO users VALUES (1);').isTruncate).toBe(false);
    });
  });

  describe('SentinelRule evaluation', () => {
    it('blocks TRUNCATE TABLE with critical severity', () => {
      const violation = truncateBlockerRule.evaluate({
        id: 'eval-truncate-block',
        toolName: 'execute_sql',
        params: { query: 'TRUNCATE TABLE accounts;' },
        timestamp: Date.now(),
      });

      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('critical');
      expect(violation?.reason).toContain('attempted to TRUNCATE [accounts]');
    });

    it('permits confirmation fallback when allowWithConfirm is true', () => {
      const confirmRule = createTruncateBlockerRule({ allowWithConfirm: true });
      const violation = confirmRule.evaluate({
        id: 'eval-truncate-confirm',
        toolName: 'sql_tool',
        params: { sql: 'TRUNCATE TABLE staging_data;' },
        timestamp: Date.now(),
      });

      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.CONFIRM);
    });

    it('SentinelEngine pipeline halts execution on TRUNCATE attempt', async () => {
      const engine = new SentinelEngine();
      engine.registerRule(truncateBlockerRule);

      const res = await engine.evaluate({
        id: 'engine-truncate-eval',
        toolName: 'postgres_query',
        params: { statement: 'TRUNCATE TABLE customers;' },
        timestamp: Date.now(),
      });

      expect(res.allowed).toBe(false);
      expect(res.verdict).toBe(Verdict.BLOCK);
      expect(res.violations[0].ruleId).toBe('sql-block-truncate');
    });
  });
});
