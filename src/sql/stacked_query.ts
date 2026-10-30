/**
 * Stacked Query and Multi-Statement SQL Injection Guard.
 * Detects and blocks unauthorized semicolon-delimited multiple statements
 * in single-query parameters (e.g. `SELECT 1; DROP TABLE users;`).
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';
import { splitSqlStatements, classifySqlQuery } from './tokenizer.js';
import { DEFAULT_SQL_QUERY_FIELDS } from './destructive_ddl.js';

export interface StackedQueryGuardOptions {
  allowMultiStatement?: boolean;
  queryFieldNames?: string[];
  maxAllowedStatements?: number;
}

export interface StackedQueryDetection {
  isStacked: boolean;
  statementCount: number;
  statements: string[];
  hasDestructiveSubstatement: boolean;
  reason?: string;
}

/**
 * Detects whether a SQL query string contains stacked multi-statements.
 */
export function detectStackedQuery(
  sql: string,
  maxAllowed: number = 1
): StackedQueryDetection {
  const statements = splitSqlStatements(sql);
  const isStacked = statements.length > maxAllowed;

  const classification = classifySqlQuery(sql);
  const hasDestructive = classification.containsDestructiveDDL || classification.containsUnconstrainedDML;

  return {
    isStacked,
    statementCount: statements.length,
    statements,
    hasDestructiveSubstatement: hasDestructive,
    reason: isStacked
      ? `Stacked query contains ${statements.length} separate statements (maximum allowed: ${maxAllowed})`
      : undefined,
  };
}

/**
 * Creates the standard SentinelRule to guard against stacked SQL queries.
 */
export function createStackedQueryGuardRule(options?: StackedQueryGuardOptions): SentinelRule {
  const allowMulti = options?.allowMultiStatement ?? false;
  const maxAllowed = options?.maxAllowedStatements ?? (allowMulti ? 100 : 1);
  const queryFields = options?.queryFieldNames || DEFAULT_SQL_QUERY_FIELDS;

  return {
    id: 'sql-block-stacked-queries',
    name: 'Guard Against Stacked Multi-Statement SQL Injections',
    category: 'sql',
    priority: 960,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      if (ctx.category && ctx.category !== 'sql' && ctx.category !== 'custom') {
        return null;
      }
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

      const detection = detectStackedQuery(sqlQuery, maxAllowed);
      if (detection.isStacked) {
        const severity = detection.hasDestructiveSubstatement ? 'critical' : 'high';

        return {
          ruleId: 'sql-block-stacked-queries',
          ruleName: 'Guard Against Stacked Multi-Statement SQL Injections',
          severity,
          verdict: Verdict.BLOCK,
          reason: `Stacked SQL injection intercepted: ${detection.reason}`,
        };
      }

      return null;
    },
  };
}

export const stackedQueryGuardRule: SentinelRule = createStackedQueryGuardRule();
