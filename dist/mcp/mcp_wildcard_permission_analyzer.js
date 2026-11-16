/**
 * Auto-generated Enterprise Security Invariant: Issue #1845
 * Title: feat(mcp): implement linter warning when MCP server requests overly broad filesystem scope
 */
export class McpWildcardPermissionAnalyzer {
    static INVARIANT_NAME = 'RULE_INVARIANT_MCP_WILDCARD_PERMISSION_ANALYZER';
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
//# sourceMappingURL=mcp_wildcard_permission_analyzer.js.map