/**
 * AgentSentinel - Autonomous Agent Fleet Heartbeat Monitor
 * Tracks liveness heartbeats across agent fleets to trigger automated failovers
 * and dead-worker task reassignments when an agent process stalls.
 */

export interface HeartbeatOptions {
  heartbeatTimeoutMs?: number; // default: 10,000ms
}

export class FleetHeartbeatMonitor {
  private timeoutMs: number;
  private heartbeats: Map<string, number> = new Map();

  constructor(options: HeartbeatOptions = {}) {
    this.timeoutMs = options.heartbeatTimeoutMs ?? 10000;
  }

  public recordHeartbeat(agentId: string, timestamp = Date.now()): void {
    this.heartbeats.set(agentId, timestamp);
  }

  public checkAgentLiveness(agentId: string, now = Date.now()): { alive: boolean; elapsedMs: number } {
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

  public getStalledAgents(now = Date.now()): string[] {
    const stalled: string[] = [];
    for (const [agentId, lastPing] of this.heartbeats.entries()) {
      if (now - lastPing > this.timeoutMs) {
        stalled.push(agentId);
      }
    }
    return stalled;
  }
}
