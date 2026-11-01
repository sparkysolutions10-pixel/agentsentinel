import { describe, it, expect } from 'vitest';
import { HeartbeatMonitor } from '../src/utils/heartbeat_monitor.js';

describe('HeartbeatMonitor', () => {
  it('flags alive and dead workers based on timeout', () => {
    const monitor = new HeartbeatMonitor(1000);
    monitor.recordHeartbeat('worker-1', 1000);
    expect(monitor.isAlive('worker-1', 1500)).toBe(true);
    expect(monitor.isAlive('worker-1', 2500)).toBe(false);
    expect(monitor.isAlive('unknown', 1500)).toBe(false);
  });
});
