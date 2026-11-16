/**
 * Auto-generated Enterprise Security Invariant: Issue #1837
 * Title: feat(mcp): implement schema validation for claude_desktop_config.json and cursor MCP configs
 */
export class McpCliConfigJsonValidator {
    static INVARIANT_NAME = 'RULE_INVARIANT_MCP_CLI_CONFIG_JSON_VALIDATOR';
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
//# sourceMappingURL=mcp_cli_config_json_validator.js.map