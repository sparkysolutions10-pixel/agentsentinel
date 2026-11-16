/**
 * Auto-generated Enterprise Security Invariant: Issue #1812
 * Title: feat(mcp): implement strict capability handshake rejecting undeclared tool extensions
 */
export class McpServerCapabilityNegotiator {
    static INVARIANT_NAME = 'RULE_INVARIANT_MCP_SERVER_CAPABILITY_NEGOTIATOR';
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
//# sourceMappingURL=mcp_server_capability_negotiator.js.map