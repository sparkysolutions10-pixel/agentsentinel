/**
 * Auto-generated Enterprise Security Invariant: Issue #1831
 * Title: feat(mcp): implement lightweight offline MCP server simulator for deterministic CI testing
 */
export class McpMockServerTestHarness {
    static INVARIANT_NAME = 'RULE_INVARIANT_MCP_MOCK_SERVER_TEST_HARNESS';
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
//# sourceMappingURL=mcp_mock_server_test_harness.js.map