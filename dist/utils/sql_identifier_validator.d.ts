/**
 * Validates and sanitizes SQL identifiers (table, column, schema names).
 */
export declare class SqlIdentifierValidator {
    private static readonly IDENTIFIER_REGEX;
    private static readonly RESERVED_WORDS;
    static isValid(name: string): boolean;
    static escape(name: string, quoteChar?: '"' | '`'): string;
}
//# sourceMappingURL=sql_identifier_validator.d.ts.map