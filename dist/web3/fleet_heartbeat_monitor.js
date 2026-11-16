/**
 * AgentSentinel - Autonomous Agent Fleet Heartbeat Monitor
 * Tracks liveness heartbeats across agent fleets to trigger automated failovers
 * and dead-worker task reassignments when an agent process stalls.
 */
export class FleetHeartbeatMonitor {
    timeoutMs;
    heartbeats = new Map();
    constructor(options = {}) {
        this.timeoutMs = options.heartbeatTimeoutMs ?? 10000;
    }
    recordHeartbeat(agentId, timestamp = Date.now()) {
        this.heartbeats.set(agentId, timestamp);
    }
    checkAgentLiveness(agentId, now = Date.now()) {
        const lastPing = this.heartbeats.get(agentId);
        if (!lastPing) {
            return { alive: false, elapsedMs: Infinity };
        }
        const elapsed = now - lastPing;
        return {
            alive: elapsed <= this.timeoutMs,
            elapsedMs: elapsed
        };
    }
    getStalledAgents(now = Date.now()) {
        const stalled = [];
        for (const [agentId, lastPing] of this.heartbeats.entries()) {
            if (now - lastPing > this.timeoutMs) {
                stalled.push(agentId);
            }
        }
        return stalled;
    }
}
//# sourceMappingURL=fleet_heartbeat_monitor.js.map