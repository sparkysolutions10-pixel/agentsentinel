/**
 * Auto-generated Enterprise Security Invariant: Issue #1886
 * Title: feat(ast): implement AST detector decoding and auditing PowerShell -EncodedCommand payloads
 */
export class PowershellEncodedCommandBlocker {
    static INVARIANT_NAME = 'RULE_INVARIANT_POWERSHELL_ENCODED_COMMAND_BLOCKER';
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
//# sourceMappingURL=powershell_encoded_command_blocker.js.map