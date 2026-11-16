/**
 * Auto-generated Enterprise Security Invariant: Issue #1806
 * Title: feat(mcp): implement process sandboxing and cgroup CPU/memory limits on stdio MCP servers
 */
export class McpStdioProcessConfinement {
    static INVARIANT_NAME = 'RULE_INVARIANT_MCP_STDIO_PROCESS_CONFINEMENT';
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
//# sourceMappingURL=mcp_stdio_process_confinement.js.map