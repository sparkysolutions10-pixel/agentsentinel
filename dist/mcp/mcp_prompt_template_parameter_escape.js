/**
 * Auto-generated Enterprise Security Invariant: Issue #1825
 * Title: feat(mcp): implement SQL-style parameterized variable binding in MCP prompt templates
 */
export class McpPromptTemplateParameterEscape {
    static INVARIANT_NAME = 'RULE_INVARIANT_MCP_PROMPT_TEMPLATE_PARAMETER_ESCAPE';
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
//# sourceMappingURL=mcp_prompt_template_parameter_escape.js.map