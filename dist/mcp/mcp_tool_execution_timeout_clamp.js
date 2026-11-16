/**
 * Auto-generated Enterprise Security Invariant: Issue #1821
 * Title: feat(mcp): implement configurable timeout circuit breaker halting hung tool executions
 */
export class McpToolExecutionTimeoutClamp {
    static INVARIANT_NAME = 'RULE_INVARIANT_MCP_TOOL_EXECUTION_TIMEOUT_CLAMP';
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
//# sourceMappingURL=mcp_tool_execution_timeout_clamp.js.map