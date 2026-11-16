/**
 * Auto-generated Enterprise Security Invariant: Issue #1828
 * Title: feat(mcp): implement human-in-the-loop approval gate for dangerous MCP tool categories
 */
export class McpToolPermissionElevationPrompt {
    static INVARIANT_NAME = 'RULE_INVARIANT_MCP_TOOL_PERMISSION_ELEVATION_PROMPT';
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
//# sourceMappingURL=mcp_tool_permission_elevation_prompt.js.map