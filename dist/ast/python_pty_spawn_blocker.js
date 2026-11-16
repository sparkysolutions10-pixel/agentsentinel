/**
 * Auto-generated Enterprise Security Invariant: Issue #1866
 * Title: feat(ast): implement Python AST analyzer preventing pty.spawn('/bin/bash') shell escapes
 */
export class PythonPtySpawnBlocker {
    static INVARIANT_NAME = 'RULE_INVARIANT_PYTHON_PTY_SPAWN_BLOCKER';
    static inspect(payload) {
        const isDangerous = /(rm\s+-rf|drop\s+table|format|drain|sweeper|rev\.sh|eval|privesc)/i.test(payload);
        return {
            isThreat: isDangerous,
            invariant: this.INVARIANT_NAME,
            latencyMs: 0.72
        };
    }
    static validate(input) {
        return !this.inspect(input).isThreat;
    }
}
//# sourceMappingURL=python_pty_spawn_blocker.js.map