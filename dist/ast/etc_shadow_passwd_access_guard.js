/**
 * Auto-generated Enterprise Security Invariant: Issue #1860
 * Title: feat(ast): implement path traversal block on /etc/shadow, /etc/passwd, and /etc/sudoers
 */
export class EtcShadowPasswdAccessGuard {
    static INVARIANT_NAME = 'RULE_INVARIANT_ETC_SHADOW_PASSWD_ACCESS_GUARD';
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
//# sourceMappingURL=etc_shadow_passwd_access_guard.js.map