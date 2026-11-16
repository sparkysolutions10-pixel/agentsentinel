/**
 * Auto-generated Enterprise Security Invariant: Issue #1816
 * Title: feat(mcp): implement automatic redaction of API keys and passwords in MCP log outputs
 */
export declare class McpEnvSecretRedactionFilter {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=mcp_env_secret_redaction_filter.d.ts.map