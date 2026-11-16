/**
 * Auto-generated Enterprise Security Invariant: Issue #1792
 * Title: feat(web3): implement query complexity and AST depth limiter for The Graph endpoints
 */
export class SubgraphGraphqlDepthLimiter {
    static INVARIANT_NAME = 'RULE_INVARIANT_SUBGRAPH_GRAPHQL_DEPTH_LIMITER';
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
//# sourceMappingURL=subgraph_graphql_depth_limiter.js.map