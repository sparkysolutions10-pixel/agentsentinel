/**
 * Mass Table TRUNCATE Query Blocker.
 * Intercepts and blocks TRUNCATE TABLE operations across PostgreSQL, MySQL,
 * and SQLite dialects to protect against irreversible table wipes.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';
import { splitSqlStatements, stripSqlComments } from './tokenizer.js';
import { stripSingleQuotedLiterals } from './destructive_ddl.js';

export interface TruncateBlockerOptions {
  allowWithConfirm?: boolean;
  queryFieldNames?: string[];
  tableWhitelist?: string[];
}

export const DEFAULT_QUERY_FIELDS = [
  'query',
  'sql',
  'statement',
  'stmt',
  'command',
  'queryText',
];

export const TRUNCATE_REGEX =
  /\bTRUNCATE(?:\s+TABLE)?(?:\s+ONLY)?\s+([`"'\[\]]?[a-zA-Z0-9_$.]+[`"'\]]?(?:\s*,\s*[`"'\[\]]?[a-zA-Z0-9_$.]+[`"'\]]?)*)/i;

/**
 * Detects if a SQL string attempts to TRUNCATE one or more tables.
 */
export function detectTruncateQuery(
  sql: string,
  whitelist: string[] = []
): { isTruncate: boolean; targetTables?: string[]; rawStatement?: string } {
  const statements = splitSqlStatements(sql);

  for (const stmt of statements) {
    const unquotedData = stripSingleQuotedLiterals(stmt);
    const match = unquotedData.match(TRUNCATE_REGEX);

    if (match) {
      const rawTargets = match[1];
      const parsedTables = rawTargets
        .split(',')
        .map((t) => t.trim().replace(/[`"'\[\]]/g, ''))
        .filter((t) => t.length > 0);

      // Check if all targeted tables are whitelisted
      const nonWhitelisted = parsedTables.filter((t) => !whitelist.includes(t));

      if (nonWhitelisted.length > 0) {
        return {
          isTruncate: true,
          targetTables: nonWhitelisted,
          rawStatement: stmt,
        };
      }
    }
  }

  return { isTruncate: false };
}

/**
 * Creates the standard SentinelRule to block table TRUNCATE statements.
 */
export function createTruncateBlockerRule(options?: TruncateBlockerOptions): SentinelRule {
  const allowConfirm = options?.allowWithConfirm ?? false;
  const queryFields = options?.queryFieldNames || DEFAULT_QUERY_FIELDS;
  const whitelist = options?.tableWhitelist || [];

  return {
    id: 'sql-block-truncate',
    name: 'Block Mass Table TRUNCATE Queries',
    category: 'sql',
    priority: 940,
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

      const detection = detectTruncateQuery(sqlQuery, whitelist);
      if (detection.isTruncate) {
        const verdict = allowConfirm ? Verdict.CONFIRM : Verdict.BLOCK;
        const severity = allowConfirm ? 'high' : 'critical';
        const tables = detection.targetTables?.join(', ') || 'unknown';

        return {
          ruleId: 'sql-block-truncate',
          ruleName: 'Block Mass Table TRUNCATE Queries',
          severity,
          verdict,
          reason: `Mass table wipe intercepted: attempted to TRUNCATE [${tables}]`,
        };
      }

      return null;
    },
  };
}

export const truncateBlockerRule: SentinelRule = createTruncateBlockerRule();
