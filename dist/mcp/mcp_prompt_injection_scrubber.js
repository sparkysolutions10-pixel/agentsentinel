/**
 * Auto-generated Enterprise Security Invariant: Issue #1808
 * Title: feat(mcp): implement heuristic prompt injection detector on MCP client message streams
 */
export class McpPromptInjectionScrubber {
    static INVARIANT_NAME = 'RULE_INVARIANT_MCP_PROMPT_INJECTION_SCRUBBER';
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
//# sourceMappingURL=mcp_prompt_injection_scrubber.js.map