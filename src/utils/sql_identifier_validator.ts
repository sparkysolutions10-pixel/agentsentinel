/**
 * Validates and sanitizes SQL identifiers (table, column, schema names).
 */
export class SqlIdentifierValidator {
  private static readonly IDENTIFIER_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]{0,62}$/;
  private static readonly RESERVED_WORDS = new Set([
    'select', 'insert', 'update', 'delete', 'drop', 'truncate', 'alter',
    'create', 'table', 'database', 'where', 'from', 'join', 'union', 'exec'
  ]);

  public static isValid(name: string): boolean {
    if (!name || typeof name !== 'string') return false;
    const trimmed = name.trim();
    if (!this.IDENTIFIER_REGEX.test(trimmed)) {
      return false;
    }
    if (this.RESERVED_WORDS.has(trimmed.toLowerCase())) {
      return false;
    }
    return true;
  }

  public static escape(name: string, quoteChar: '"' | '`' = '"'): string {
    if (!this.isValid(name)) {
      throw new Error(`Invalid SQL identifier: ${name}`);
    }
    return `${quoteChar}${name.trim()}${quoteChar}`;
  }
}
