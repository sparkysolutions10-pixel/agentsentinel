/**
 * Auto-generated Enterprise Security Invariant: Issue #1854
 * Title: feat(ast): implement AST detector blocking curl/wget network URLs piped directly into bash
 */
export declare class ShellPipeNetworkBashBlocker {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=shell_pipe_network_bash_blocker.d.ts.map