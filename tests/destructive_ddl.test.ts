import { describe, it, expect } from 'vitest';
import {
  detectDestructiveDdl,
  createDestructiveDdlRule,
  destructiveDdlRule,
} from '../src/sql/destructive_ddl.js';
import { SentinelEngine } from '../src/index.js';
import { Verdict } from '../src/types.js';

describe('Destructive DDL Blocker (DROP TABLE/DATABASE/SCHEMA) (#58)', () => {
  describe('detectDestructiveDdl detector', () => {
    it('detects DROP TABLE query', () => {
      const res = detectDestructiveDdl('DROP TABLE users;');
      expect(res.isDestructive).toBe(true);
      expect(res.objectType).toBe('TABLE');
      expect(res.targetName).toBe('users');
    });

    it('detects DROP DATABASE query', () => {
      const res = detectDestructiveDdl('DROP DATABASE production_db;');
      expect(res.isDestructive).toBe(true);
      expect(res.objectType).toBe('DATABASE');
      expect(res.targetName).toBe('production_db');
    });

    it('detects DROP SCHEMA IF EXISTS query', () => {
      const res = detectDestructiveDdl('DROP SCHEMA IF EXISTS analytics CASCADE;');
      expect(res.isDestructive).toBe(true);
      expect(res.objectType).toBe('SCHEMA');
      expect(res.targetName).toBe('analytics');
    });

    it('passes safe queries (SELECT, INSERT, UPDATE, CREATE)', () => {
      expect(detectDestructiveDdl('SELECT * FROM users;').isDestructive).toBe(false);
      expect(detectDestructiveDdl('CREATE TABLE users (id INT);').isDestructive).toBe(false);
      expect(detectDestructiveDdl('UPDATE users SET name = "Bob";').isDestructive).toBe(false);
    });
  });

  describe('SentinelRule integration', () => {
    it('blocks DROP TABLE with critical severity by default', () => {
      const violation = destructiveDdlRule.evaluate({
        id: 'eval-drop-tbl',
        toolName: 'execute_sql',
        params: { query: 'DROP TABLE orders;' },
        timestamp: Date.now(),
      });

      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('critical');
      expect(violation?.reason).toContain('attempted to DROP TABLE [orders]');
    });

    it('returns CONFIRM when allowWithConfirm option is enabled', () => {
      const rule = createDestructiveDdlRule({ allowWithConfirm: true });
      const violation = rule.evaluate({
        id: 'eval-drop-confirm',
        toolName: 'db_query',
        params: { sql: 'DROP DATABASE test;' },
        timestamp: Date.now(),
      });

      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.CONFIRM);
      expect(violation?.severity).toBe('high');
    });

    it('SentinelEngine pipeline blocks destructive DDL query call', async () => {
      const engine = new SentinelEngine();
      engine.registerRule(destructiveDdlRule);

      const res = await engine.evaluate({
        id: 'engine-eval-ddl',
        toolName: 'sql_tool',
        params: { statement: 'DROP TABLE accounts;' },
        timestamp: Date.now(),
      });

      expect(res.allowed).toBe(false);
      expect(res.verdict).toBe(Verdict.BLOCK);
      expect(res.violations[0].ruleId).toBe('sql-block-destructive-ddl');
    });
  });
});
