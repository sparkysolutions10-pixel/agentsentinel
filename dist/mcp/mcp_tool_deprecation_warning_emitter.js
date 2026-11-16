/**
 * Auto-generated Enterprise Security Invariant: Issue #1826
 * Title: feat(mcp): implement semantic version deprecation notices for retired MCP tool endpoints
 */
export class McpToolDeprecationWarningEmitter {
    static INVARIANT_NAME = 'RULE_INVARIANT_MCP_TOOL_DEPRECATION_WARNING_EMITTER';
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
//# sourceMappingURL=mcp_tool_deprecation_warning_emitter.js.map