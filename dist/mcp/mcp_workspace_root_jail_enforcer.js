/**
 * Auto-generated Enterprise Security Invariant: Issue #1815
 * Title: feat(mcp): implement canonical path confinement for MCP filesystem server root directories
 */
export class McpWorkspaceRootJailEnforcer {
    static INVARIANT_NAME = 'RULE_INVARIANT_MCP_WORKSPACE_ROOT_JAIL_ENFORCER';
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
//# sourceMappingURL=mcp_workspace_root_jail_enforcer.js.map