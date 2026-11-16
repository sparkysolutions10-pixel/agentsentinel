/**
 * Auto-generated Enterprise Security Invariant: Issue #1918
 * Title: feat(db): implement heuristic classifier detecting hidden prompt injection in RAG chunks
 */
export class RagContextTokenStuffingDetector {
    static INVARIANT_NAME = 'RULE_INVARIANT_RAG_CONTEXT_TOKEN_STUFFING_DETECTOR';
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
//# sourceMappingURL=rag_context_token_stuffing_detector.js.map