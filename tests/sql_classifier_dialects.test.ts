import { describe, it, expect } from 'vitest';
import {
  classifySqlStatement,
  classifySqlQuery,
} from '../src/sql/tokenizer.js';

describe('SQL Classifier Cross-Dialect Categorization (#57)', () => {
  describe('DML Classification (SELECT, INSERT, UPDATE, DELETE, MERGE)', () => {
    it('classifies CTE WITH queries as SELECT DML', () => {
      const sql = 'WITH regional_sales AS (SELECT * FROM orders) SELECT * FROM regional_sales;';
      const stmt = classifySqlStatement(sql);
      expect(stmt.command).toBe('SELECT');
      expect(stmt.category).toBe('DML');
      expect(stmt.isDestructive).toBe(false);
    });

    it('classifies PostgreSQL upsert INSERT ON CONFLICT', () => {
      const sql = 'INSERT INTO customers (id, name) VALUES (1, "A") ON CONFLICT (id) DO NOTHING;';
      const stmt = classifySqlStatement(sql);
      expect(stmt.command).toBe('INSERT');
      expect(stmt.category).toBe('DML');
      expect(stmt.targetTable).toBe('customers');
    });

    it('classifies MySQL REPLACE/INSERT queries', () => {
      const sql = 'INSERT INTO `inventory` (`item_id`, `qty`) VALUES (101, 50);';
      const stmt = classifySqlStatement(sql);
      expect(stmt.command).toBe('INSERT');
      expect(stmt.targetTable).toBe('inventory');
    });

    it('classifies complex multi-table UPDATE', () => {
      const sql = 'UPDATE users u JOIN profiles p ON u.id = p.user_id SET u.active = 1 WHERE u.created_at > "2026-01-01";';
      const stmt = classifySqlStatement(sql);
      expect(stmt.command).toBe('UPDATE');
      expect(stmt.category).toBe('DML');
      expect(stmt.hasWhereClause).toBe(true);
    });

    it('classifies DELETE with table schema prefix (schema.table)', () => {
      const sql = 'DELETE FROM public.audit_records WHERE event_time < NOW() - INTERVAL "30 days";';
      const stmt = classifySqlStatement(sql);
      expect(stmt.command).toBe('DELETE');
      expect(stmt.category).toBe('DML');
      expect(stmt.isDestructive).toBe(true);
      expect(stmt.hasWhereClause).toBe(true);
      expect(stmt.targetTable).toBe('public.audit_records');
    });

    it('classifies MERGE INTO statements', () => {
      const sql = 'MERGE INTO target_table USING source_table ON target_table.id = source_table.id;';
      const stmt = classifySqlStatement(sql);
      expect(stmt.command).toBe('MERGE');
      expect(stmt.category).toBe('DML');
    });
  });

  describe('DDL Classification (DROP, TRUNCATE, ALTER, CREATE)', () => {
    it('classifies DROP TABLE with schema prefix and IF EXISTS', () => {
      const sql = 'DROP TABLE IF EXISTS "analytics"."daily_metrics";';
      const stmt = classifySqlStatement(sql);
      expect(stmt.command).toBe('DROP');
      expect(stmt.category).toBe('DDL');
      expect(stmt.isDestructive).toBe(true);
      expect(stmt.targetTable).toBe('analytics.daily_metrics');
    });

    it('classifies TRUNCATE TABLE across backtick quotes', () => {
      const sql = 'TRUNCATE TABLE `cache_store`;';
      const stmt = classifySqlStatement(sql);
      expect(stmt.command).toBe('TRUNCATE');
      expect(stmt.category).toBe('DDL');
      expect(stmt.isDestructive).toBe(true);
      expect(stmt.targetTable).toBe('cache_store');
    });

    it('classifies ALTER TABLE ADD COLUMN', () => {
      const sql = 'ALTER TABLE users ADD COLUMN phone VARCHAR(20);';
      const stmt = classifySqlStatement(sql);
      expect(stmt.command).toBe('ALTER');
      expect(stmt.category).toBe('DDL');
    });

    it('classifies CREATE INDEX / CREATE TABLE', () => {
      const sql = 'CREATE INDEX idx_user_email ON users(email);';
      const stmt = classifySqlStatement(sql);
      expect(stmt.command).toBe('CREATE');
      expect(stmt.category).toBe('DDL');
    });
  });

  describe('Multi-Statement Batch Classification', () => {
    it('classifies mixed query payload with SELECT and TRUNCATE', () => {
      const batch = `
        -- Read user balance
        SELECT balance FROM accounts WHERE id = 10;
        /* Dangerous wipe */
        TRUNCATE TABLE accounts;
      `;
      const res = classifySqlQuery(batch);
      expect(res.isMultiStatement).toBe(true);
      expect(res.statements.length).toBe(2);
      expect(res.containsDestructiveDDL).toBe(true);
      expect(res.statements[0].command).toBe('SELECT');
      expect(res.statements[1].command).toBe('TRUNCATE');
    });
  });
});
