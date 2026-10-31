import { describe, it, expect, beforeEach } from 'vitest';
import { CounterMetricCollector } from '../src/utils/counter_metric_collector.js';

describe('CounterMetricCollector', () => {
  let counter: CounterMetricCollector;

  beforeEach(() => {
    counter = new CounterMetricCollector('agent_tool_calls_total', 'Total tool calls executed');
  });

  it('increments by default value of 1', () => {
    counter.inc();
    expect(counter.get()).toBe(1);
    counter.inc();
    expect(counter.get()).toBe(2);
  });

  it('increments by explicit amount', () => {
    counter.inc(5);
    expect(counter.get()).toBe(5);
    counter.inc(10);
    expect(counter.get()).toBe(15);
  });

  it('throws on negative increment', () => {
    expect(() => counter.inc(-1)).toThrow('Counter metric can only be increased by non-negative amounts');
  });

  it('tracks distinct label sets independently', () => {
    counter.inc({ tool: 'web_search', status: 'success' }, 3);
    counter.inc({ tool: 'execute_shell', status: 'blocked' }, 1);

    expect(counter.get({ tool: 'web_search', status: 'success' })).toBe(3);
    expect(counter.get({ tool: 'execute_shell', status: 'blocked' })).toBe(1);
    expect(counter.get({ tool: 'other' })).toBe(0);
  });

  it('resets all counts', () => {
    counter.inc(10);
    counter.reset();
    expect(counter.get()).toBe(0);
  });

  it('exports to Prometheus text exposition format', () => {
    counter.inc({ status: 'ok' }, 4);
    const output = counter.toPrometheus();
    expect(output).toContain('# HELP agent_tool_calls_total Total tool calls executed');
    expect(output).toContain('# TYPE agent_tool_calls_total counter');
    expect(output).toContain('agent_tool_calls_total{status="ok"} 4');
  });
});
