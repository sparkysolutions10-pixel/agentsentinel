/**
 * Auto-generated Enterprise Security Invariant: Issue #1817
 * Title: feat(mcp): implement tenant namespace partitioning preventing cross-tenant MCP bleed
 */
export declare class McpMultiTenantContextIsolation {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=mcp_multi_tenant_context_isolation.d.ts.map