/**
 * Unconstrained DELETE Without WHERE Clause Detector.
 * Intercepts and blocks dangerous table-wide mass deletions, including:
 * 1. Missing WHERE clause (e.g. DELETE FROM users;)
 * 2. Tautological / Always-True WHERE clauses (e.g. WHERE 1=1, WHERE 'a'='a', WHERE TRUE)
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';
import { splitSqlStatements } from './tokenizer.js';
import { stripSingleQuotedLiterals, DEFAULT_SQL_QUERY_FIELDS } from './destructive_ddl.js';

export interface UnconstrainedDeleteOptions {
  allowWithConfirm?: boolean;
  queryFieldNames?: string[];
  tableWhitelist?: string[];
}

const TABLE_IDENT = '([`"\'\\[]?[a-zA-Z0-9_$]+[`"\'\\]]?(?:\\.[`"\'\\[]?[a-zA-Z0-9_$]+[`"\'\\]]?)*)';
export const DELETE_STATEMENT_REGEX = new RegExp(`^\\s*DELETE(?:\\s+FROM)?\\s+${TABLE_IDENT}(?:\\s+(.*))?$`, 'i');

// Tautological WHERE clauses that evaluate to always-true
export const TAUTOLOGY_REGEXES = [
  /\bWHERE\s+1\s*=\s*1\b/i,
  /\bWHERE\s+0\s*=\s*0\b/i,
  /\bWHERE\s+TRUE\b/i,
  /\bWHERE\s+1\b/i,
  /\bWHERE\s+['"][a-zA-Z0-9_]+['"]\s*=\s*['"][a-zA-Z0-9_]+['"]\b/i,
  /\bWHERE\s+NULL\s+IS\s+NULL\b/i,
];

export interface UnconstrainedDeleteDetection {
  isUnconstrained: boolean;
  targetTable?: string;
  hasWhereClause?: boolean;
  isTautologicalWhere?: boolean;
  rawStatement?: string;
}

/**
 * Evaluates whether a SQL query attempts an unconstrained mass deletion.
 */
export function detectUnconstrainedDelete(
  sql: string,
  whitelist: string[] = []
): UnconstrainedDeleteDetection {
  const statements = splitSqlStatements(sql);

  for (const stmt of statements) {
    const unquoted = stripSingleQuotedLiterals(stmt).trim();
    const match = unquoted.match(DELETE_STATEMENT_REGEX);

    if (match) {
      const targetTable = match[1].replace(/[`"'\[\]]/g, '');
      const remainder = match[2] ? match[2].trim() : '';

      // Check if table is whitelisted
      if (whitelist.includes(targetTable)) {
        continue;
      }

      const hasWhere = /\bWHERE\b/i.test(remainder);

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

      // 2. Check for tautological WHERE clause
      for (const tRegex of TAUTOLOGY_REGEXES) {
        if (tRegex.test(stmt)) {
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
 * Creates the standard SentinelRule to block unconstrained DELETE queries.
 */
export function createUnconstrainedDeleteRule(options?: UnconstrainedDeleteOptions): SentinelRule {
  const allowConfirm = options?.allowWithConfirm ?? false;
  const queryFields = options?.queryFieldNames || DEFAULT_SQL_QUERY_FIELDS;
  const whitelist = options?.tableWhitelist || [];

  return {
    id: 'sql-block-unconstrained-delete',
    name: 'Block Unconstrained DELETE Queries Without WHERE Clause',
    category: 'sql',
    priority: 930,
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

      const detection = detectUnconstrainedDelete(sqlQuery, whitelist);
      if (detection.isUnconstrained) {
        const verdict = allowConfirm ? Verdict.CONFIRM : Verdict.BLOCK;
        const severity = allowConfirm ? 'high' : 'critical';
        const reasonDetail = detection.isTautologicalWhere
          ? `tautological always-true WHERE clause detected`
          : `missing WHERE boundary clause`;

        return {
          ruleId: 'sql-block-unconstrained-delete',
          ruleName: 'Block Unconstrained DELETE Queries Without WHERE Clause',
          severity,
          verdict,
          reason: `Unconstrained mass DELETE blocked on [${detection.targetTable}]: ${reasonDetail}`,
        };
      }

      return null;
    },
  };
}

export const unconstrainedDeleteRule: SentinelRule = createUnconstrainedDeleteRule();
