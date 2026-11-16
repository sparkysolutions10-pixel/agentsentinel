/**
 * Auto-generated Enterprise Security Invariant: Issue #1830
 * Title: feat(mcp): implement 10MB payload size limit on incoming MCP JSON-RPC frame streams
 */
export declare class McpContentLengthDosProtector {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=mcp_content_length_dos_protector.d.ts.map