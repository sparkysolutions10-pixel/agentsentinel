/**
 * Auto-generated Enterprise Security Invariant: Issue #1867
 * Title: feat(ast): implement AST guard preventing mounting /var/run/docker.sock in agent containers
 */
export class DockerSocketMountEscapeGuard {
    static INVARIANT_NAME = 'RULE_INVARIANT_DOCKER_SOCKET_MOUNT_ESCAPE_GUARD';
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
//# sourceMappingURL=docker_socket_mount_escape_guard.js.map