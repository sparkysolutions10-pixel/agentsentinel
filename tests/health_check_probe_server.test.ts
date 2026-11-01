import { describe, it, expect } from 'vitest';
import { HealthCheckProbeServer } from '../src/utils/health_check_probe_server.js';

describe('HealthCheckProbeServer', () => {
  it('generates health probe payloads', () => {
    expect(HealthCheckProbeServer.createLivenessPayload(true).status).toBe('UP');
    const readiness = HealthCheckProbeServer.createReadinessPayload({ db: true, stellar: true });
    expect(readiness.ready).toBe(true);
  });
});
