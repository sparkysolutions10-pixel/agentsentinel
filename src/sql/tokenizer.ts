/**
 * Zero-dependency SQL Query Tokenizer and Statement Classifier.
 * Analyzes raw SQL queries, strips comments, decomposes stacked/multi-statement queries,
 * and categorizes statements into DML, DDL, TCL, DCL, and ADMIN types.
 */

export type SqlCommandType =
  | 'SELECT'
  | 'INSERT'
  | 'UPDATE'
  | 'DELETE'
  | 'DROP'
  | 'TRUNCATE'
  | 'ALTER'
  | 'CREATE'
  | 'MERGE'
  | 'GRANT'
  | 'REVOKE'
  | 'COMMIT'
  | 'ROLLBACK'
  | 'PRAGMA'
  | 'SHOW'
  | 'SET'
  | 'USE'
  | 'EXPLAIN'
  | 'UNKNOWN';

export type SqlStatementCategory = 'DML' | 'DDL' | 'DCL' | 'TCL' | 'ADMIN' | 'UNKNOWN';

export interface SqlStatement {
  raw: string;
  command: SqlCommandType;
  category: SqlStatementCategory;
  isDestructive: boolean;
  hasWhereClause: boolean;
  targetTable?: string;
}

export interface SqlClassificationResult {
  statements: SqlStatement[];
  isMultiStatement: boolean;
  containsDestructiveDDL: boolean;
  containsUnconstrainedDML: boolean;
}

/**
 * Strips line comments (-- ...) and block comments (/* ... *\/) while preserving strings.
 */
export function stripSqlComments(sql: string): string {
  if (!sql || typeof sql !== 'string') return '';

  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inBacktick = false;
  let inLineComment = false;
  let inBlockComment = false;

  let result = '';
  const len = sql.length;

  for (let i = 0; i < len; i++) {
    const char = sql[i];
    const nextChar = i + 1 < len ? sql[i + 1] : '';

    // Handle line comments
    if (inLineComment) {
      if (char === '\n' || char === '\r') {
        inLineComment = false;
        result += char;
      }
      continue;
    }

    // Handle block comments
    if (inBlockComment) {
      if (char === '*' && nextChar === '/') {
        inBlockComment = false;
        i++; // skip '/'
      }
      continue;
    }

    // Handle quote states
    if (char === "'" && !inDoubleQuote && !inBacktick) {
      inSingleQuote = !inSingleQuote;
      result += char;
      continue;
    }

    if (char === '"' && !inSingleQuote && !inBacktick) {
      inDoubleQuote = !inDoubleQuote;
      result += char;
      continue;
    }

    if (char === '`' && !inSingleQuote && !inDoubleQuote) {
      inBacktick = !inBacktick;
      result += char;
      continue;
    }

    // If inside a quoted string, preserve character
    if (inSingleQuote || inDoubleQuote || inBacktick) {
      result += char;
      continue;
    }

    // Check for comment starts outside quotes
    if (char === '-' && nextChar === '-') {
      inLineComment = true;
      i++; // skip next '-'
      continue;
    }

    if (char === '/' && nextChar === '*') {
      inBlockComment = true;
      i++; // skip next '*'
      continue;
    }

    result += char;
  }

  return result.trim();
}

/**
 * Splits SQL into individual statements by semicolon delimiter, respecting quote boundaries.
 */
export function splitSqlStatements(sql: string): string[] {
  const stripped = stripSqlComments(sql);
  if (!stripped) return [];

  const statements: string[] = [];
  let current = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inBacktick = false;

  for (let i = 0; i < stripped.length; i++) {
    const char = stripped[i];

    if (char === "'" && !inDoubleQuote && !inBacktick) {
      inSingleQuote = !inSingleQuote;
    } else if (char === '"' && !inSingleQuote && !inBacktick) {
      inDoubleQuote = !inDoubleQuote;
    } else if (char === '`' && !inSingleQuote && !inDoubleQuote) {
      inBacktick = !inBacktick;
    }

    if (char === ';' && !inSingleQuote && !inDoubleQuote && !inBacktick) {
      const trimmed = current.trim();
      if (trimmed.length > 0) {
        statements.push(trimmed);
      }
      current = '';
    } else {
      current += char;
    }
  }

  const finalTrimmed = current.trim();
  if (finalTrimmed.length > 0) {
    statements.push(finalTrimmed);
  }

  return statements;
}

/**
 * Extracts target table identifier from statement.
 */
function extractTargetTable(cleanSql: string, command: SqlCommandType): string | undefined {
  let regex: RegExp | null = null;

  if (command === 'SELECT') {
    regex = /\bFROM\s+([`"']?[a-zA-Z0-9_$.]+[`"']?)/i;
  } else if (command === 'INSERT') {
    regex = /\bINTO\s+([`"']?[a-zA-Z0-9_$.]+[`"']?)/i;
  } else if (command === 'UPDATE') {
    regex = /\bUPDATE\s+([`"']?[a-zA-Z0-9_$.]+[`"']?)/i;
  } else if (command === 'DELETE') {
    regex = /\bFROM\s+([`"']?[a-zA-Z0-9_$.]+[`"']?)/i;
  } else if (command === 'DROP' || command === 'TRUNCATE') {
    regex = /\bTABLE\s+(?:IF\s+EXISTS\s+)?([`"']?[a-zA-Z0-9_$.]+[`"']?)/i;
  }

  if (regex) {
    const match = cleanSql.match(regex);
    if (match && match[1]) {
      return match[1].replace(/[`"']/g, '');
    }
  }

  return undefined;
}

/**
 * Classifies a single SQL statement.
 */
export function classifySqlStatement(rawStatement: string): SqlStatement {
  const clean = rawStatement.trim();
  const firstWordMatch = clean.match(/^([a-zA-Z]+)/);
  const firstWord = firstWordMatch ? firstWordMatch[1].toUpperCase() : '';

  let command: SqlCommandType = 'UNKNOWN';
  let category: SqlStatementCategory = 'UNKNOWN';
  let isDestructive = false;

  switch (firstWord) {
    case 'SELECT':
    case 'WITH':
      command = 'SELECT';
      category = 'DML';
      break;
    case 'INSERT':
      command = 'INSERT';
      category = 'DML';
      break;
    case 'UPDATE':
      command = 'UPDATE';
      category = 'DML';
      break;
    case 'DELETE':
      command = 'DELETE';
      category = 'DML';
      isDestructive = true;
      break;
    case 'MERGE':
      command = 'MERGE';
      category = 'DML';
      break;
    case 'DROP':
      command = 'DROP';
      category = 'DDL';
      isDestructive = true;
      break;
    case 'TRUNCATE':
      command = 'TRUNCATE';
      category = 'DDL';
      isDestructive = true;
      break;
    case 'ALTER':
      command = 'ALTER';
      category = 'DDL';
      break;
    case 'CREATE':
      command = 'CREATE';
      category = 'DDL';
      break;
    case 'GRANT':
      command = 'GRANT';
      category = 'DCL';
      break;
    case 'REVOKE':
      command = 'REVOKE';
      category = 'DCL';
      break;
    case 'COMMIT':
      command = 'COMMIT';
      category = 'TCL';
      break;
    case 'ROLLBACK':
      command = 'ROLLBACK';
      category = 'TCL';
      break;
    case 'PRAGMA':
      command = 'PRAGMA';
      category = 'ADMIN';
      break;
    case 'SHOW':
      command = 'SHOW';
      category = 'ADMIN';
      break;
    case 'SET':
      command = 'SET';
      category = 'ADMIN';
      break;
    case 'USE':
      command = 'USE';
      category = 'ADMIN';
      break;
    case 'EXPLAIN':
      command = 'EXPLAIN';
      category = 'ADMIN';
      break;
    default:
      command = 'UNKNOWN';
      category = 'UNKNOWN';
  }

  // Check for WHERE clause
  const hasWhereClause = /\bWHERE\b/i.test(clean);
  const targetTable = extractTargetTable(clean, command);

  return {
    raw: clean,
    command,
    category,
    isDestructive,
    hasWhereClause,
    targetTable,
  };
}

/**
 * Classifies an entire raw SQL query string, including multiple statements.
 */
export function classifySqlQuery(sql: string): SqlClassificationResult {
  const rawStatements = splitSqlStatements(sql);
  const statements = rawStatements.map(classifySqlStatement);

  const isMultiStatement = statements.length > 1;
  const containsDestructiveDDL = statements.some(
    (s) => s.category === 'DDL' && (s.command === 'DROP' || s.command === 'TRUNCATE')
  );
  const containsUnconstrainedDML = statements.some(
    (s) => (s.command === 'DELETE' || s.command === 'UPDATE') && !s.hasWhereClause
  );

  return {
    statements,
    isMultiStatement,
    containsDestructiveDDL,
    containsUnconstrainedDML,
  };
}
