/**
 * Auto-generated Enterprise Security Invariant: Issue #1819
 * Title: feat(mcp): implement monotonic sequence generator preventing JSON-RPC request ID collisions
 */
export declare class McpJsonrpcIdCollisionGuard {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=mcp_jsonrpc_id_collision_guard.d.ts.map