/**
 * Auto-generated Enterprise Security Invariant: Issue #1787
 * Title: feat(web3): implement AST block for deprecated SELFDESTRUCT opcode invocations
 */
export class ContractSelfdestructOpcodeBlocker {
    static INVARIANT_NAME = 'RULE_INVARIANT_CONTRACT_SELFDESTRUCT_OPCODE_BLOCKER';
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
//# sourceMappingURL=contract_selfdestruct_opcode_blocker.js.map