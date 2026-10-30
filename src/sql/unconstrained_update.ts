/**
 * Unconstrained UPDATE Without WHERE Clause Detector.
 * Intercepts and blocks dangerous table-wide updates, preventing accidental mass modifications:
 * 1. Missing WHERE clause (e.g. UPDATE accounts SET balance = 0;)
 * 2. Tautological / Always-True WHERE clauses (e.g. WHERE 1=1, WHERE 'a'='a', WHERE TRUE)
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';
import { splitSqlStatements } from './tokenizer.js';
import { stripSingleQuotedLiterals, DEFAULT_SQL_QUERY_FIELDS } from './destructive_ddl.js';
import { TAUTOLOGY_REGEXES } from './unconstrained_delete.js';

export interface UnconstrainedUpdateOptions {
  allowWithConfirm?: boolean;
  queryFieldNames?: string[];
  tableWhitelist?: string[];
}

const TABLE_IDENT = '([`"\'\\[]?[a-zA-Z0-9_$]+[`"\'\\]]?(?:\\.[`"\'\\[]?[a-zA-Z0-9_$]+[`"\'\\]]?)*)';
export const UPDATE_STATEMENT_REGEX = new RegExp(`^\\s*UPDATE\\s+${TABLE_IDENT}\\s+SET\\s+(.*)$`, 'i');

export interface UnconstrainedUpdateDetection {
  isUnconstrained: boolean;
  targetTable?: string;
  hasWhereClause?: boolean;
  isTautologicalWhere?: boolean;
  rawStatement?: string;
}

/**
 * Evaluates whether a SQL query attempts an unconstrained mass update.
 */
export function detectUnconstrainedUpdate(
  sql: string,
  whitelist: string[] = []
): UnconstrainedUpdateDetection {
  const statements = splitSqlStatements(sql);

  for (const stmt of statements) {
    const unquoted = stripSingleQuotedLiterals(stmt).trim();
    const match = unquoted.match(UPDATE_STATEMENT_REGEX);

    if (match) {
      const targetTable = match[1].replace(/[`"'\[\]]/g, '');
      const setBody = match[2] ? match[2].trim() : '';

      // Check if table is whitelisted
      if (whitelist.includes(targetTable)) {
        continue;
      }

      const hasWhere = /\bWHERE\b/i.test(setBody);

      // 1. Missing WHERE clause
      if (!hasWhere) {
        return {
          isUnconstrained: true,
          targetTable,
          hasWhereClause: false,
          isTautologicalWhere: false,
          rawStatement: stmt,
        };
      }

      // 2. Check for tautological WHERE clause on both original statement and unquoted
      for (const tRegex of TAUTOLOGY_REGEXES) {
        if (tRegex.test(stmt) || tRegex.test(unquoted)) {
          return {
            isUnconstrained: true,
            targetTable,
            hasWhereClause: true,
            isTautologicalWhere: true,
            rawStatement: stmt,
          };
        }
      }
    }
  }

  return { isUnconstrained: false };
}

/**
 * Creates the standard SentinelRule to block unconstrained UPDATE queries.
 */
export function createUnconstrainedUpdateRule(options?: UnconstrainedUpdateOptions): SentinelRule {
  const allowConfirm = options?.allowWithConfirm ?? false;
  const queryFields = options?.queryFieldNames || DEFAULT_SQL_QUERY_FIELDS;
  const whitelist = options?.tableWhitelist || [];

  return {
    id: 'sql-block-unconstrained-update',
    name: 'Block Unconstrained UPDATE Queries Without WHERE Clause',
    category: 'sql',
    priority: 920,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      let sqlQuery: string | null = null;
      if (ctx.params) {
        for (const field of queryFields) {
          if (typeof ctx.params[field] === 'string' && ctx.params[field].trim() !== '') {
            sqlQuery = ctx.params[field];
            break;
          }
        }
      }

      if (!sqlQuery) {
        return null;
      }

      const detection = detectUnconstrainedUpdate(sqlQuery, whitelist);
      if (detection.isUnconstrained) {
        const verdict = allowConfirm ? Verdict.CONFIRM : Verdict.BLOCK;
        const severity = allowConfirm ? 'high' : 'critical';
        const reasonDetail = detection.isTautologicalWhere
          ? `tautological always-true WHERE clause detected`
          : `missing WHERE boundary clause`;

        return {
          ruleId: 'sql-block-unconstrained-update',
          ruleName: 'Block Unconstrained UPDATE Queries Without WHERE Clause',
          severity,
          verdict,
          reason: `Unconstrained mass UPDATE blocked on [${detection.targetTable}]: ${reasonDetail}`,
        };
      }

      return null;
    },
  };
}

export const unconstrainedUpdateRule: SentinelRule = createUnconstrainedUpdateRule();
