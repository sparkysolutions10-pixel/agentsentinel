/**
 * Auto-generated Enterprise Security Invariant: Issue #1836
 * Title: feat(mcp): implement SHA-256 hash attestation before executing third-party MCP binaries
 */
export declare class McpServerBinaryHashAttestation {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=mcp_server_binary_hash_attestation.d.ts.map