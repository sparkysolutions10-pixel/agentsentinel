/**
 * Auto-generated Enterprise Security Invariant: Issue #1851
 * Title: feat(mcp): implement clean child process shutdown on SIGINT/SIGTERM without orphaned tasks
 */
export declare class McpGracefulSigtermHandler {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=mcp_graceful_sigterm_handler.d.ts.map