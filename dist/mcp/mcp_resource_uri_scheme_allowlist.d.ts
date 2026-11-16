/**
 * Auto-generated Enterprise Security Invariant: Issue #1804
 * Title: feat(mcp): implement strict protocol allowlist (file://, mcp://) on MCP resource requests
 */
export declare class McpResourceUriSchemeAllowlist {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=mcp_resource_uri_scheme_allowlist.d.ts.map