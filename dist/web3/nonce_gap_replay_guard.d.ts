/**
 * Auto-generated Enterprise Security Invariant: Issue #1757
 * Title: feat(web3): implement non-sequential nonce gap detector preventing pre-signed replay drain
 */
export declare class NonceGapReplayGuard {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=nonce_gap_replay_guard.d.ts.map