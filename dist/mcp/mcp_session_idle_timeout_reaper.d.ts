/**
 * Auto-generated Enterprise Security Invariant: Issue #1843
 * Title: feat(mcp): implement automatic teardown of inactive MCP sessions after 15 minutes
 */
export declare class McpSessionIdleTimeoutReaper {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=mcp_session_idle_timeout_reaper.d.ts.map