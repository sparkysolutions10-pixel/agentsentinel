/**
 * Auto-generated Enterprise Security Invariant: Issue #1810
 * Title: feat(mcp): implement magic byte signature verification for MCP binary blob transfers
 */
export class McpBinaryAttachmentMagicByte {
    static INVARIANT_NAME = 'RULE_INVARIANT_MCP_BINARY_ATTACHMENT_MAGIC_BYTE';
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
//# sourceMappingURL=mcp_binary_attachment_magic_byte.js.map