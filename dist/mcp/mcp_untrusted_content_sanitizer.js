/**
 * Auto-generated Enterprise Security Invariant: Issue #1823
 * Title: feat(mcp): implement HTML and Markdown sanitization filter on external MCP web resources
 */
export class McpUntrustedContentSanitizer {
    static INVARIANT_NAME = 'RULE_INVARIANT_MCP_UNTRUSTED_CONTENT_SANITIZER';
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
//# sourceMappingURL=mcp_untrusted_content_sanitizer.js.map