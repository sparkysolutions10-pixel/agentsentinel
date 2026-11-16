/**
 * Auto-generated Enterprise Security Invariant: Issue #1955
 * Title: feat(fintech): implement 24-hour idempotency key cache preventing double-billing replays
 */
export declare class StripeIdempotencyKeyReplayGuard {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=stripe_idempotency_key_replay_guard.d.ts.map