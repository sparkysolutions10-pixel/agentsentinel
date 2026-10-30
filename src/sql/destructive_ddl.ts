/**
 * Destructive DDL Blocker.
 * Intercepts and blocks DROP TABLE, DROP DATABASE, and DROP SCHEMA statements
 * to prevent catastrophic data loss in database tool calls.
 * Supports requiring human confirmation or strictly blocking DDL drops.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';
import { splitSqlStatements, stripSqlComments } from './tokenizer.js';

export interface DestructiveDdlOptions {
  allowWithConfirm?: boolean;
  blockedObjects?: ('TABLE' | 'DATABASE' | 'SCHEMA' | 'VIEW')[];
  queryFieldNames?: string[];
}

export const DEFAULT_SQL_QUERY_FIELDS = [
  'query',
  'sql',
  'statement',
  'stmt',
  'command',
  'queryText',
];

export const DROP_DDL_REGEX =
  /\bDROP\s+(TABLE|DATABASE|SCHEMA|VIEW)\s+(?:IF\s+EXISTS\s+)?([`"'\[\]]?[a-zA-Z0-9_$]+[`"'\]]?(?:\.[`"'\[\]]?[a-zA-Z0-9_$]+[`"'\]]?)*)/i;

/**
 * Detects if a SQL query string contains a destructive DROP statement.
 */
export function detectDestructiveDdl(
  sql: string,
  blockedObjects: string[] = ['TABLE', 'DATABASE', 'SCHEMA']
): { isDestructive: boolean; objectType?: string; targetName?: string; rawStatement?: string } {
  const statements = splitSqlStatements(sql);

  for (const stmt of statements) {
    const match = stmt.match(DROP_DDL_REGEX);
    if (match) {
      const objType = match[1].toUpperCase();
      const target = match[2].replace(/[`"'\[\]]/g, '');

      if (blockedObjects.includes(objType)) {
        return {
          isDestructive: true,
          objectType: objType,
          targetName: target,
          rawStatement: stmt,
        };
      }
    }
  }

  return { isDestructive: false };
}

/**
 * Creates the standard SentinelRule to block destructive DDL operations.
 */
export function createDestructiveDdlRule(options?: DestructiveDdlOptions): SentinelRule {
  const allowConfirm = options?.allowWithConfirm ?? false;
  const blockedObjects = options?.blockedObjects || ['TABLE', 'DATABASE', 'SCHEMA'];
  const queryFields = options?.queryFieldNames || DEFAULT_SQL_QUERY_FIELDS;

  return {
    id: 'sql-block-destructive-ddl',
    name: 'Block Destructive SQL DDL (DROP TABLE / DATABASE / SCHEMA)',
    category: 'sql',
    priority: 950,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      // Find SQL query string in tool call params
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

      const detection = detectDestructiveDdl(sqlQuery, blockedObjects);
      if (detection.isDestructive) {
        const verdict = allowConfirm ? Verdict.CONFIRM : Verdict.BLOCK;
        const severity = allowConfirm ? 'high' : 'critical';

        return {
          ruleId: 'sql-block-destructive-ddl',
          ruleName: 'Block Destructive SQL DDL (DROP TABLE / DATABASE / SCHEMA)',
          severity,
          verdict,
          reason: `Destructive DDL query intercepted: attempted to DROP ${detection.objectType} [${detection.targetName}]`,
        };
      }

      return null;
    },
  };
}

export const destructiveDdlRule: SentinelRule = createDestructiveDdlRule();
