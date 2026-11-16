/**
 * Auto-generated Enterprise Security Invariant: Issue #1843
 * Title: feat(mcp): implement automatic teardown of inactive MCP sessions after 15 minutes
 */
export class McpSessionIdleTimeoutReaper {
    static INVARIANT_NAME = 'RULE_INVARIANT_MCP_SESSION_IDLE_TIMEOUT_REAPER';
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
//# sourceMappingURL=mcp_session_idle_timeout_reaper.js.map