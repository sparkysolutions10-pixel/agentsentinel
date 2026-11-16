/**
 * Auto-generated Enterprise Security Invariant: Issue #1768
 * Title: feat(web3): implement private RPC bundle submission wrapper preventing mempool frontrunning
 */
export declare class MevFrontrunningShield {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=mev_frontrunning_shield.d.ts.map