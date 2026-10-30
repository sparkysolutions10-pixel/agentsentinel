import { describe, it, expect } from 'vitest';
import {
  detectDestructiveDdl,
  createDestructiveDdlRule,
  destructiveDdlRule,
} from '../src/sql/destructive_ddl.js';
import { Verdict } from '../src/types.js';

describe('DROP TABLE Blocker Signatures and Quotes (#59)', () => {
  describe('Casing and Whitespace Variations', () => {
    it('intercepts lowercase drop table', () => {
      const res = detectDestructiveDdl('drop table users;');
      expect(res.isDestructive).toBe(true);
      expect(res.targetName).toBe('users');
    });

    it('intercepts mixed casing (dRoP tAbLe)', () => {
      const res = detectDestructiveDdl('dRoP tAbLe "orders";');
      expect(res.isDestructive).toBe(true);
      expect(res.targetName).toBe('orders');
    });

    it('intercepts tabs and multiline whitespace (DROP\\nTABLE)', () => {
      const res = detectDestructiveDdl('DROP\n\tTABLE\n  customers;');
      expect(res.isDestructive).toBe(true);
      expect(res.targetName).toBe('customers');
    });
  });

  describe('Quote Encapsulation Variations', () => {
    it('intercepts double quoted identifiers ("users")', () => {
      const res = detectDestructiveDdl('DROP TABLE "users";');
      expect(res.isDestructive).toBe(true);
      expect(res.targetName).toBe('users');
    });

    it('intercepts MySQL backtick quoted identifiers (`customers`)', () => {
      const res = detectDestructiveDdl('DROP TABLE IF EXISTS `customers`;');
      expect(res.isDestructive).toBe(true);
      expect(res.targetName).toBe('customers');
    });

    it('intercepts MSSQL bracket quoted identifiers ([accounts])', () => {
      const res = detectDestructiveDdl('DROP TABLE [accounts];');
      expect(res.isDestructive).toBe(true);
      expect(res.targetName).toBe('accounts');
    });

    it('intercepts schema-qualified targets (public.users, "analytics"."sessions")', () => {
      const res1 = detectDestructiveDdl('DROP TABLE public.users;');
      expect(res1.isDestructive).toBe(true);
      expect(res1.targetName).toBe('public.users');

      const res2 = detectDestructiveDdl('DROP TABLE "analytics"."sessions";');
      expect(res2.isDestructive).toBe(true);
      expect(res2.targetName).toBe('analytics.sessions');
    });
  });

  describe('Stacked Injection and Embedded String Literal Defense', () => {
    it('intercepts stacked DROP TABLE behind valid SELECT', () => {
      const sql = 'SELECT id FROM users WHERE id = 1; DROP TABLE users;';
      const res = detectDestructiveDdl(sql);
      expect(res.isDestructive).toBe(true);
    });

    it('does NOT block queries where DROP TABLE appears strictly inside a string literal', () => {
      const sql = "SELECT * FROM audit_logs WHERE message = 'DROP TABLE users';";
      const res = detectDestructiveDdl(sql);
      expect(res.isDestructive).toBe(false);
    });

    it('rule evaluation blocks tool call for DROP TABLE "orders"', () => {
      const violation = destructiveDdlRule.evaluate({
        id: 'call-drop-test',
        toolName: 'execute_sql',
        params: { query: 'DROP TABLE "orders";' },
        timestamp: Date.now(),
      });

      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('critical');
    });
  });
});
