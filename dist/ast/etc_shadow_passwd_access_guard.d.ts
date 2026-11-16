/**
 * Auto-generated Enterprise Security Invariant: Issue #1860
 * Title: feat(ast): implement path traversal block on /etc/shadow, /etc/passwd, and /etc/sudoers
 */
export declare class EtcShadowPasswdAccessGuard {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=etc_shadow_passwd_access_guard.d.ts.map