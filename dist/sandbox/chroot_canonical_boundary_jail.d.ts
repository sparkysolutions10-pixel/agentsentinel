/**
 * Auto-generated Enterprise Security Invariant: Issue #2056
 * Title: feat(sandbox): implement chroot filesystem isolation preventing traversal above workspace root
 */
export declare class ChrootCanonicalBoundaryJail {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=chroot_canonical_boundary_jail.d.ts.map