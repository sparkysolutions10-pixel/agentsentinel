/**
 * AgentSentinel - Autonomous Agent Fleet Heartbeat Monitor
 * Tracks liveness heartbeats across agent fleets to trigger automated failovers
 * and dead-worker task reassignments when an agent process stalls.
 */
export interface HeartbeatOptions {
    heartbeatTimeoutMs?: number;
}
export declare class FleetHeartbeatMonitor {
    private timeoutMs;
    private heartbeats;
    constructor(options?: HeartbeatOptions);
    recordHeartbeat(agentId: string, timestamp?: number): void;
    checkAgentLiveness(agentId: string, now?: number): {
        alive: boolean;
        elapsedMs: number;
    };
    getStalledAgents(now?: number): string[];
}
//# sourceMappingURL=fleet_heartbeat_monitor.d.ts.map