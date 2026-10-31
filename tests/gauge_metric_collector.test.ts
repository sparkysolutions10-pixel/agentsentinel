import { describe, it, expect, beforeEach } from 'vitest';
import { GaugeMetricCollector } from '../src/utils/gauge_metric_collector.js';

describe('GaugeMetricCollector', () => {
  let gauge: GaugeMetricCollector;

  beforeEach(() => {
    gauge = new GaugeMetricCollector('agent_active_sessions', 'Active agent sessions');
  });

  it('sets and retrieves values', () => {
    gauge.set(42);
    expect(gauge.get()).toBe(42);
    gauge.set(10);
    expect(gauge.get()).toBe(10);
  });

  it('increments and decrements values correctly', () => {
    gauge.set(10);
    gauge.inc(5);
    expect(gauge.get()).toBe(15);
    gauge.dec(3);
    expect(gauge.get()).toBe(12);
  });

  it('tracks historical min and max accurately', () => {
    gauge.set(20);
    gauge.inc(15); // 35
    gauge.dec(30); // 5
    gauge.inc(10); // 15

    expect(gauge.get()).toBe(15);
    expect(gauge.getMin()).toBe(5);
    expect(gauge.getMax()).toBe(35);
  });

  it('supports multidimensional labels', () => {
    gauge.set(8, { tenant: 'alpha', env: 'prod' });
    gauge.set(3, { tenant: 'beta', env: 'dev' });

    expect(gauge.get({ tenant: 'alpha', env: 'prod' })).toBe(8);
    expect(gauge.get({ tenant: 'beta', env: 'dev' })).toBe(3);
  });

  it('exports valid Prometheus exposition string', () => {
    gauge.set(100, { cluster: 'us-east' });
    const prom = gauge.toPrometheus();
    expect(prom).toContain('# HELP agent_active_sessions Active agent sessions');
    expect(prom).toContain('# TYPE agent_active_sessions gauge');
    expect(prom).toContain('agent_active_sessions{cluster="us-east"} 100');
  });
});
