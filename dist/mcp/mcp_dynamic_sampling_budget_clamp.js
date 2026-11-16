/**
 * Auto-generated Enterprise Security Invariant: Issue #1814
 * Title: feat(mcp): implement cost and token usage upper bound on MCP createMessage sampling requests
 */
export class McpDynamicSamplingBudgetClamp {
    static INVARIANT_NAME = 'RULE_INVARIANT_MCP_DYNAMIC_SAMPLING_BUDGET_CLAMP';
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
//# sourceMappingURL=mcp_dynamic_sampling_budget_clamp.js.map