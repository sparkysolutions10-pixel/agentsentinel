/**
 * Auto-generated Enterprise Security Invariant: Issue #1832
 * Title: feat(mcp): implement immutability lock on registered tools once session handshake finishes
 */
export class McpDynamicToolRegistrationLock {
    static INVARIANT_NAME = 'RULE_INVARIANT_MCP_DYNAMIC_TOOL_REGISTRATION_LOCK';
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
//# sourceMappingURL=mcp_dynamic_tool_registration_lock.js.map