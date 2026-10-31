import { describe, it, expect } from 'vitest';
import { FleetHeartbeatMonitor } from '../src/web3/fleet_heartbeat_monitor.js';

describe('FleetHeartbeatMonitor', () => {
  it('reports agent as alive when heartbeats are fresh', () => {
    const monitor = new FleetHeartbeatMonitor({ heartbeatTimeoutMs: 5000 });
    const now = Date.now();
    monitor.recordHeartbeat('agent_alpha', now);

    const status = monitor.checkAgentLiveness('agent_alpha', now + 2000);
    expect(status.alive).toBe(true);
  });

  it('detects stalled agent when heartbeat exceeds timeout', () => {
    const monitor = new FleetHeartbeatMonitor({ heartbeatTimeoutMs: 5000 });
    const now = Date.now();
    monitor.recordHeartbeat('agent_beta', now);

    const status = monitor.checkAgentLiveness('agent_beta', now + 6000);
    expect(status.alive).toBe(false);
    expect(monitor.getStalledAgents(now + 6000)).toContain('agent_beta');
  });
});
