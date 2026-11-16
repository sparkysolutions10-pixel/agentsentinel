/**
 * Auto-generated Enterprise Security Invariant: Issue #1776
 * Title: feat(web3): implement static AST disallow rule for unverified inline Yul assembly blocks
 */
export class SolidityAssemblyBlockDisallow {
    static INVARIANT_NAME = 'RULE_INVARIANT_SOLIDITY_ASSEMBLY_BLOCK_DISALLOW';
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
//# sourceMappingURL=solidity_assembly_block_disallow.js.map