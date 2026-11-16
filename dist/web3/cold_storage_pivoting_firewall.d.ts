/**
 * Auto-generated Enterprise Security Invariant: Issue #1766
 * Title: feat(web3): implement isolation barrier preventing hot-to-cold key signature requests
 */
export declare class ColdStoragePivotingFirewall {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=cold_storage_pivoting_firewall.d.ts.map