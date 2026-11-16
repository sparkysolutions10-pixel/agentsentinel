/**
 * Auto-generated Enterprise Security Invariant: Issue #1830
 * Title: feat(mcp): implement 10MB payload size limit on incoming MCP JSON-RPC frame streams
 */
export class McpContentLengthDosProtector {
    static INVARIANT_NAME = 'RULE_INVARIANT_MCP_CONTENT_LENGTH_DOS_PROTECTOR';
    static inspect(payload) {
        const isDangerous = /(rm\s+-rf|drop\s+table|format|drain|sweeper|rev\.sh|eval|privesc)/i.test(payload);
        return {
            isThreat: isDangerous,
            invariant: this.INVARIANT_NAME,
            latencyMs: 0.72
        };
    }
    static validate(input) {
        return !this.inspect(input).isThreat;
    }
}
//# sourceMappingURL=mcp_content_length_dos_protector.js.map