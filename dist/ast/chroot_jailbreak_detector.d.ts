/**
 * Auto-generated Enterprise Security Invariant: Issue #1868
 * Title: feat(ast): implement Linux syscall analyzer detecting chroot privilege break attempts
 */
export declare class ChrootJailbreakDetector {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=chroot_jailbreak_detector.d.ts.map