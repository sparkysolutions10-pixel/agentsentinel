import { describe, it, expect } from 'vitest';
import {
  detectUnconstrainedUpdate,
  unconstrainedUpdateRule,
} from '../src/sql/unconstrained_update.js';
import { Verdict } from '../src/types.js';

describe('Mass UPDATE Detection Signatures (#65)', () => {
  describe('Specific Pattern Verifications', () => {
    it("detects UPDATE users SET role = 'admin' missing WHERE boundary", () => {
      const sql = "UPDATE users SET role = 'admin';";
      const res = detectUnconstrainedUpdate(sql);

      expect(res.isUnconstrained).toBe(true);
      expect(res.targetTable).toBe('users');
      expect(res.hasWhereClause).toBe(false);
    });

    it('detects multiple column updates without WHERE clause', () => {
      const sql = 'UPDATE employees SET salary = salary * 1.5, department = "VIP";';
      const res = detectUnconstrainedUpdate(sql);

      expect(res.isUnconstrained).toBe(true);
      expect(res.targetTable).toBe('employees');
    });

    it('detects quoted table identifiers ("users", `accounts`, [roles])', () => {
      expect(detectUnconstrainedUpdate('UPDATE "users" SET active = 1;').isUnconstrained).toBe(true);
      expect(detectUnconstrainedUpdate('UPDATE `accounts` SET balance = 0;').isUnconstrained).toBe(true);
      expect(detectUnconstrainedUpdate('UPDATE [roles] SET permission = "*";').isUnconstrained).toBe(true);
    });

    it('detects mass update with tautological WHERE conditions', () => {
      const cases = [
        "UPDATE users SET role = 'admin' WHERE 1 = 1;",
        "UPDATE users SET role = 'admin' WHERE 'a' = 'a';",
        "UPDATE users SET role = 'admin' WHERE TRUE;",
        "UPDATE users SET role = 'admin' WHERE 0 = 0;",
      ];

      for (const sql of cases) {
        const res = detectUnconstrainedUpdate(sql);
        expect(res.isUnconstrained).toBe(true);
        expect(res.isTautologicalWhere).toBe(true);
      }
    });

    it('detects stacked mass update in composite query', () => {
      const sql = "SELECT * FROM users WHERE id = 1; UPDATE users SET role = 'admin';";
      const res = detectUnconstrainedUpdate(sql);

      expect(res.isUnconstrained).toBe(true);
      expect(res.targetTable).toBe('users');
    });
  });

  describe('Bounded Query Passthrough', () => {
    it('permits bounded update with strict WHERE clause', () => {
      const sql = "UPDATE users SET role = 'admin' WHERE id = 42;";
      const res = detectUnconstrainedUpdate(sql);

      expect(res.isUnconstrained).toBe(false);
    });
  });

  describe('SentinelRule evaluation', () => {
    it('blocks mass update tool call with critical severity', () => {
      const violation = unconstrainedUpdateRule.evaluate({
        id: 'eval-mass-upd',
        toolName: 'execute_sql',
        params: { query: "UPDATE users SET role = 'admin';" },
        timestamp: Date.now(),
      });

      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('critical');
      expect(violation?.reason).toContain('Unconstrained mass UPDATE blocked on [users]');
    });
  });
});
