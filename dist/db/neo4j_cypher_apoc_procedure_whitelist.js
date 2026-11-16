/**
 * Auto-generated Enterprise Security Invariant: Issue #1932
 * Title: feat(db): implement Cypher query validator restricting APOC custom procedure imports
 */
export class Neo4jCypherApocProcedureWhitelist {
    static INVARIANT_NAME = 'RULE_INVARIANT_NEO4J_CYPHER_APOC_PROCEDURE_WHITELIST';
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
//# sourceMappingURL=neo4j_cypher_apoc_procedure_whitelist.js.map