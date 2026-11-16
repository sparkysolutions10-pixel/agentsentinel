/**
 * Auto-generated Enterprise Security Invariant: Issue #1808
 * Title: feat(mcp): implement heuristic prompt injection detector on MCP client message streams
 */
export declare class McpPromptInjectionScrubber {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=mcp_prompt_injection_scrubber.d.ts.map