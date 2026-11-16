export interface SessionClampConfig {
    maxMessages?: number;
    maxDurationSeconds?: number;
}
export declare class SessionAutoExpirationClamp {
    private count;
    private startTimestamp;
    private maxMsgs;
    private maxDurationMs;
    constructor(config?: SessionClampConfig);
    step(): boolean;
    shouldRekey(): boolean;
    reset(): void;
}
//# sourceMappingURL=session_clamp.d.ts.map