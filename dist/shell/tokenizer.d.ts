/**
 * High-performance Bash / POSIX Shell Command Tokenizer and Pipeline AST Parser.
 * Accurately extracts executables, flags, chained pipelines (|, &&, ||), and nested subshells ($(..), `..`).
 */
export type ShellChainingOperator = '|' | '||' | '&&' | ';' | '&';
export interface ShellStage {
    raw: string;
    executable: string;
    args: string[];
    flags: string[];
    operator?: ShellChainingOperator;
    subshells: string[];
    envVars: Record<string, string>;
    redirects: string[];
}
export interface ParsedShellPipeline {
    raw: string;
    stages: ShellStage[];
    allExecutables: string[];
    allSubshells: string[];
    hasChainedOperators: boolean;
}
/**
 * Splits a raw shell string into atomic shell tokens, respecting quotes, escapes, and substitutions.
 */
export declare function tokenizeShellString(input: string): string[];
/**
 * Extracts subshell commands enclosed in $(...) or `...`.
 */
export declare function extractSubshellCommands(input: string): string[];
/**
 * Parses a complete shell command line into structured stages, operators, executables, and subshells.
 */
export declare function parseShellCommand(commandString: string): ParsedShellPipeline;
//# sourceMappingURL=tokenizer.d.ts.map