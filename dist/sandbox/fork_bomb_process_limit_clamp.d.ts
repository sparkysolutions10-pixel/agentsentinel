/**
 * Auto-generated Enterprise Security Invariant: Issue #2059
 * Title: feat(sandbox): implement pids.max cgroup limit restricting child processes to 50
 */
export declare class ForkBombProcessLimitClamp {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=fork_bomb_process_limit_clamp.d.ts.map