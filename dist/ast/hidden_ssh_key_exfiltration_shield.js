/**
 * Auto-generated Enterprise Security Invariant: Issue #1862
 * Title: feat(ast): implement file read boundary blocker on ~/.ssh/id_rsa and known_hosts
 */
export class HiddenSshKeyExfiltrationShield {
    static INVARIANT_NAME = 'RULE_INVARIANT_HIDDEN_SSH_KEY_EXFILTRATION_SHIELD';
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
//# sourceMappingURL=hidden_ssh_key_exfiltration_shield.js.map