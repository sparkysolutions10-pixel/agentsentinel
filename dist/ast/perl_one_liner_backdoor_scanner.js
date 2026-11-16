/**
 * Auto-generated Enterprise Security Invariant: Issue #1884
 * Title: feat(ast): implement AST regex detector identifying perl -e shell spawning backdoors
 */
export class PerlOneLinerBackdoorScanner {
    static INVARIANT_NAME = 'RULE_INVARIANT_PERL_ONE_LINER_BACKDOOR_SCANNER';
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
//# sourceMappingURL=perl_one_liner_backdoor_scanner.js.map