import { describe, it, expect } from 'vitest';
import {
  stripSqlComments,
  splitSqlStatements,
  classifySqlStatement,
  classifySqlQuery,
} from '../src/sql/tokenizer.js';

describe('SQL Query Tokenizer and Statement Classifier (#56)', () => {
  describe('stripSqlComments', () => {
    it('strips single-line comments (-- comment)', () => {
      const sql = 'SELECT * FROM users; -- this is a comment\nSELECT id FROM orders;';
      const stripped = stripSqlComments(sql);
      expect(stripped).not.toContain('-- this is a comment');
      expect(stripped).toContain('SELECT * FROM users;');
      expect(stripped).toContain('SELECT id FROM orders;');
    });

    it('strips block comments (/* ... */)', () => {
      const sql = '/* Header block comment */ SELECT /* inline */ name FROM accounts;';
      const stripped = stripSqlComments(sql);
      expect(stripped).toBe('SELECT  name FROM accounts;');
    });

    it('preserves comment markers inside single-quoted strings', () => {
      const sql = "SELECT * FROM logs WHERE message = '-- not a comment' AND note = '/* keep */';";
      const stripped = stripSqlComments(sql);
      expect(stripped).toContain("'-- not a comment'");
      expect(stripped).toContain("'/* keep */'");
    });

    it('preserves comment markers inside double-quoted identifiers', () => {
      const sql = 'SELECT "--column" FROM "table--name";';
      const stripped = stripSqlComments(sql);
      expect(stripped).toContain('"--column"');
      expect(stripped).toContain('"table--name"');
    });
  });

  describe('splitSqlStatements', () => {
    it('splits multiple statements delimited by semicolons', () => {
      const sql = 'SELECT 1; UPDATE users SET active = 1; DELETE FROM sessions;';
      const statements = splitSqlStatements(sql);

      expect(statements.length).toBe(3);
      expect(statements[0]).toBe('SELECT 1');
      expect(statements[1]).toBe('UPDATE users SET active = 1');
      expect(statements[2]).toBe('DELETE FROM sessions');
    });

    it('does not split on semicolons embedded inside string literals', () => {
      const sql = "INSERT INTO logs (data) VALUES ('one; two; three;'); SELECT 1;";
      const statements = splitSqlStatements(sql);

      expect(statements.length).toBe(2);
      expect(statements[0]).toContain("'one; two; three;'");
      expect(statements[1]).toBe('SELECT 1');
    });

    it('handles trailing whitespace and empty statements gracefully', () => {
      const sql = '  ; SELECT 1; ; ; ';
      const statements = splitSqlStatements(sql);

      expect(statements.length).toBe(1);
      expect(statements[0]).toBe('SELECT 1');
    });
  });

  describe('classifySqlStatement', () => {
    it('classifies DML SELECT statements', () => {
      const stmt = classifySqlStatement('SELECT id, name FROM users WHERE active = 1');
      expect(stmt.command).toBe('SELECT');
      expect(stmt.category).toBe('DML');
      expect(stmt.isDestructive).toBe(false);
      expect(stmt.hasWhereClause).toBe(true);
      expect(stmt.targetTable).toBe('users');
    });

    it('classifies DML INSERT statements', () => {
      const stmt = classifySqlStatement('INSERT INTO customers (name) VALUES ("Alice")');
      expect(stmt.command).toBe('INSERT');
      expect(stmt.category).toBe('DML');
      expect(stmt.isDestructive).toBe(false);
      expect(stmt.targetTable).toBe('customers');
    });

    it('classifies DML UPDATE with WHERE clause', () => {
      const stmt = classifySqlStatement('UPDATE accounts SET balance = 0 WHERE id = 42');
      expect(stmt.command).toBe('UPDATE');
      expect(stmt.category).toBe('DML');
      expect(stmt.hasWhereClause).toBe(true);
      expect(stmt.targetTable).toBe('accounts');
    });

    it('classifies DML DELETE without WHERE clause as destructive', () => {
      const stmt = classifySqlStatement('DELETE FROM sessions');
      expect(stmt.command).toBe('DELETE');
      expect(stmt.category).toBe('DML');
      expect(stmt.isDestructive).toBe(true);
      expect(stmt.hasWhereClause).toBe(false);
      expect(stmt.targetTable).toBe('sessions');
    });

    it('classifies DDL DROP TABLE as destructive', () => {
      const stmt = classifySqlStatement('DROP TABLE IF EXISTS `audit_logs`');
      expect(stmt.command).toBe('DROP');
      expect(stmt.category).toBe('DDL');
      expect(stmt.isDestructive).toBe(true);
      expect(stmt.targetTable).toBe('audit_logs');
    });

    it('classifies DDL TRUNCATE as destructive', () => {
      const stmt = classifySqlStatement('TRUNCATE TABLE transactions');
      expect(stmt.command).toBe('TRUNCATE');
      expect(stmt.category).toBe('DDL');
      expect(stmt.isDestructive).toBe(true);
      expect(stmt.targetTable).toBe('transactions');
    });

    it('classifies DDL CREATE TABLE', () => {
      const stmt = classifySqlStatement('CREATE TABLE test (id INT PRIMARY KEY)');
      expect(stmt.command).toBe('CREATE');
      expect(stmt.category).toBe('DDL');
      expect(stmt.isDestructive).toBe(false);
    });

    it('classifies TCL and ADMIN statements (COMMIT, PRAGMA, EXPLAIN)', () => {
      expect(classifySqlStatement('COMMIT').category).toBe('TCL');
      expect(classifySqlStatement('ROLLBACK').category).toBe('TCL');
      expect(classifySqlStatement('PRAGMA foreign_keys = ON').category).toBe('ADMIN');
      expect(classifySqlStatement('EXPLAIN SELECT 1').category).toBe('ADMIN');
    });
  });

  describe('classifySqlQuery composite analysis', () => {
    it('detects multi-statement injection containing stacked DROP TABLE', () => {
      const sql = 'SELECT * FROM users WHERE id = 1; DROP TABLE users;';
      const res = classifySqlQuery(sql);

      expect(res.isMultiStatement).toBe(true);
      expect(res.containsDestructiveDDL).toBe(true);
      expect(res.statements.length).toBe(2);
      expect(res.statements[1].command).toBe('DROP');
    });

    it('detects unconstrained DML across statements', () => {
      const sql = 'DELETE FROM orders;';
      const res = classifySqlQuery(sql);

      expect(res.containsUnconstrainedDML).toBe(true);
      expect(res.containsDestructiveDDL).toBe(false);
    });
  });
});
