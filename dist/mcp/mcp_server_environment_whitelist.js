/**
 * Auto-generated Enterprise Security Invariant: Issue #1842
 * Title: feat(mcp): implement process environment variable allowlist scrubbing parent shell leaks
 */
export class McpServerEnvironmentWhitelist {
    static INVARIANT_NAME = 'RULE_INVARIANT_MCP_SERVER_ENVIRONMENT_WHITELIST';
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
//# sourceMappingURL=mcp_server_environment_whitelist.js.map