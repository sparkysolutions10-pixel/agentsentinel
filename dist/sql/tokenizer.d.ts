/**
 * Zero-dependency SQL Query Tokenizer and Statement Classifier.
 * Analyzes raw SQL queries, strips comments, decomposes stacked/multi-statement queries,
 * and categorizes statements into DML, DDL, TCL, DCL, and ADMIN types.
 */
export type SqlCommandType = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'DROP' | 'TRUNCATE' | 'ALTER' | 'CREATE' | 'MERGE' | 'GRANT' | 'REVOKE' | 'COMMIT' | 'ROLLBACK' | 'PRAGMA' | 'SHOW' | 'SET' | 'USE' | 'EXPLAIN' | 'UNKNOWN';
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
 * Also handles MySQL hash comments (# ...) and escaped quotes.
 */
export declare function stripSqlComments(sql: string): string;
/**
 * Splits SQL into individual statements by semicolon delimiter, respecting quote boundaries and escapes.
 */
export declare function splitSqlStatements(sql: string): string[];
/**
 * Classifies a single SQL statement.
 */
export declare function classifySqlStatement(rawStatement: string): SqlStatement;
/**
 * Classifies an entire raw SQL query string, including multiple statements.
 */
export declare function classifySqlQuery(sql: string): SqlClassificationResult;
//# sourceMappingURL=tokenizer.d.ts.map