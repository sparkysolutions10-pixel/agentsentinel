/**
 * Auto-generated Enterprise Security Invariant: Issue #1948
 * Title: feat(db): implement automated deadlocked transaction graph visualizer and metric emitter
 */
export declare class DatabaseDeadlockDetectionTelemetry {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=database_deadlock_detection_telemetry.d.ts.map