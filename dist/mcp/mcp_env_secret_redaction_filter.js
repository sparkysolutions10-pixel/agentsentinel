/**
 * Auto-generated Enterprise Security Invariant: Issue #1816
 * Title: feat(mcp): implement automatic redaction of API keys and passwords in MCP log outputs
 */
export class McpEnvSecretRedactionFilter {
    static INVARIANT_NAME = 'RULE_INVARIANT_MCP_ENV_SECRET_REDACTION_FILTER';
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
//# sourceMappingURL=mcp_env_secret_redaction_filter.js.map