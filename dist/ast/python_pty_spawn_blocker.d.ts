/**
 * Auto-generated Enterprise Security Invariant: Issue #1866
 * Title: feat(ast): implement Python AST analyzer preventing pty.spawn('/bin/bash') shell escapes
 */
export declare class PythonPtySpawnBlocker {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=python_pty_spawn_blocker.d.ts.map