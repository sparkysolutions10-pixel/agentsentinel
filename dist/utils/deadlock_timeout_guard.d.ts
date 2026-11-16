/**
 * DeadlockTimeoutGuard - Promise timeout boundary enforcer.
 */
export declare class DeadlockTimeoutGuard {
    static withTimeout<T>(promise: Promise<T>, timeoutMs: number, operationName?: string): Promise<T>;
}
//# sourceMappingURL=deadlock_timeout_guard.d.ts.map