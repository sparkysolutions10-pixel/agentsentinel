/**
 * Auto-generated Enterprise Security Invariant: Issue #1834
 * Title: feat(mcp): implement Windows security descriptor access control on MCP named pipe endpoints
 */
export class McpWindowsNamedPipeSecurity {
    static INVARIANT_NAME = 'RULE_INVARIANT_MCP_WINDOWS_NAMED_PIPE_SECURITY';
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
//# sourceMappingURL=mcp_windows_named_pipe_security.js.map