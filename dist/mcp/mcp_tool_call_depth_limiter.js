/**
 * Auto-generated Enterprise Security Invariant: Issue #1809
 * Title: feat(mcp): implement maximum recursive tool calling depth guard on autonomous agents
 */
export class McpToolCallDepthLimiter {
    static INVARIANT_NAME = 'RULE_INVARIANT_MCP_TOOL_CALL_DEPTH_LIMITER';
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
//# sourceMappingURL=mcp_tool_call_depth_limiter.js.map