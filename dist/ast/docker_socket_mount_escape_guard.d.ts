/**
 * Auto-generated Enterprise Security Invariant: Issue #1867
 * Title: feat(ast): implement AST guard preventing mounting /var/run/docker.sock in agent containers
 */
export declare class DockerSocketMountEscapeGuard {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=docker_socket_mount_escape_guard.d.ts.map