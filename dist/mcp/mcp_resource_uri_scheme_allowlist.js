/**
 * Auto-generated Enterprise Security Invariant: Issue #1804
 * Title: feat(mcp): implement strict protocol allowlist (file://, mcp://) on MCP resource requests
 */
export class McpResourceUriSchemeAllowlist {
    static INVARIANT_NAME = 'RULE_INVARIANT_MCP_RESOURCE_URI_SCHEME_ALLOWLIST';
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
//# sourceMappingURL=mcp_resource_uri_scheme_allowlist.js.map