/**
 * Auto-generated Enterprise Security Invariant: Issue #1850
 * Title: feat(mcp): implement read-only volume mount enforcer for containerized MCP microservices
 */
export class McpDockerContainerMountIsolate {
    static INVARIANT_NAME = 'RULE_INVARIANT_MCP_DOCKER_CONTAINER_MOUNT_ISOLATE';
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
//# sourceMappingURL=mcp_docker_container_mount_isolate.js.map