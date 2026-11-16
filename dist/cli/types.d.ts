import { RuleViolation, Verdict } from '../types.js';
export interface CliOptions {
    command?: 'audit' | 'audit-log' | 'check' | 'eval' | 'init' | 'version' | 'help' | 'mcp' | 'serve' | 'install';
    file?: string;
    policyFile?: string;
    format?: 'text' | 'json';
    strict?: boolean;
    dryRun?: boolean;
    verbose?: boolean;
    toolName?: string;
    paramsJson?: string;
    targetString?: string;
    preset?: 'enterprise' | 'developer' | 'minimal';
    force?: boolean;
    port?: number;
    host?: string;
    apiKey?: string;
}
export interface CliAuditReport {
    target: string;
    clean: boolean;
    verdict: Verdict;
    violations: RuleViolation[];
    latencyMs: number;
    summary: string;
}
export declare const CLI_EXIT_CODES: {
    readonly SUCCESS: 0;
    readonly VIOLATION_BLOCKED: 1;
    readonly FILE_NOT_FOUND: 2;
    readonly INVALID_ARGS: 3;
    readonly PARSE_ERROR: 4;
};
//# sourceMappingURL=types.d.ts.map