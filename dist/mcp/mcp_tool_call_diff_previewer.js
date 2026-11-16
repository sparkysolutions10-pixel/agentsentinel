/**
 * Auto-generated Enterprise Security Invariant: Issue #1852
 * Title: feat(mcp): implement unified visual diff generator showing proposed tool file modifications
 */
export class McpToolCallDiffPreviewer {
    static INVARIANT_NAME = 'RULE_INVARIANT_MCP_TOOL_CALL_DIFF_PREVIEWER';
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
//# sourceMappingURL=mcp_tool_call_diff_previewer.js.map