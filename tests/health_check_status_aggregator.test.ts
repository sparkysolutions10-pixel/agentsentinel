import { describe, it, expect } from 'vitest';
import { HealthCheckStatusAggregator } from '../src/utils/health_check_status_aggregator.js';

describe('HealthCheckStatusAggregator', () => {
  it('aggregates all healthy probes as HEALTHY (200)', async () => {
    const agg = new HealthCheckStatusAggregator();
    agg.registerProbe('db', () => ({ status: 'HEALTHY' }));
    agg.registerProbe('redis', async () => ({ status: 'HEALTHY' }));

    const report = await agg.runChecks();
    expect(report.status).toBe('HEALTHY');
    expect(report.statusCode).toBe(200);
    expect(report.probes.length).toBe(2);
  });

  it('aggregates to DEGRADED (200) when a non-critical probe is degraded', async () => {
    const agg = new HealthCheckStatusAggregator();
    agg.registerProbe('db', () => ({ status: 'HEALTHY' }));
    agg.registerProbe('cache', () => ({ status: 'DEGRADED', message: 'high memory' }));

    const report = await agg.runChecks();
    expect(report.status).toBe('DEGRADED');
    expect(report.statusCode).toBe(200);
  });

  it('aggregates to UNHEALTHY (503) when any probe fails or throws', async () => {
    const agg = new HealthCheckStatusAggregator();
    agg.registerProbe('db', () => ({ status: 'DEGRADED' }));
    agg.registerProbe('stellar_rpc', () => {
      throw new Error('Connection refused');
    });

    const report = await agg.runChecks();
    expect(report.status).toBe('UNHEALTHY');
    expect(report.statusCode).toBe(503);
    const failedProbe = report.probes.find(p => p.name === 'stellar_rpc');
    expect(failedProbe?.status).toBe('UNHEALTHY');
    expect(failedProbe?.message).toContain('Connection refused');
  });
});
