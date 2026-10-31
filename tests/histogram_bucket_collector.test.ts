import { describe, it, expect, beforeEach } from 'vitest';
import { HistogramBucketCollector } from '../src/utils/histogram_bucket_collector.js';

describe('HistogramBucketCollector', () => {
  let hist: HistogramBucketCollector;

  beforeEach(() => {
    hist = new HistogramBucketCollector('http_request_duration_ms', 'Request duration in ms', [10, 50, 100]);
  });

  it('records observations in appropriate cumulative buckets', () => {
    hist.observe(5);   // <= 10, <= 50, <= 100, +Inf
    hist.observe(20);  // <= 50, <= 100, +Inf
    hist.observe(75);  // <= 100, +Inf
    hist.observe(150); // +Inf

    expect(hist.getCount()).toBe(4);
    expect(hist.getSum()).toBe(250);

    const buckets = hist.getBucketCounts();
    expect(buckets).toEqual([
      { le: 10, count: 1 },
      { le: 50, count: 2 },
      { le: 100, count: 3 },
      { le: '+Inf', count: 4 }
    ]);
  });

  it('formats to valid Prometheus exposition lines', () => {
    hist.observe(5);
    const prom = hist.toPrometheus();
    expect(prom).toContain('# HELP http_request_duration_ms Request duration in ms');
    expect(prom).toContain('# TYPE http_request_duration_ms histogram');
    expect(prom).toContain('http_request_duration_ms_bucket{le="10"} 1');
    expect(prom).toContain('http_request_duration_ms_bucket{le="+Inf"} 1');
    expect(prom).toContain('http_request_duration_ms_sum 5');
    expect(prom).toContain('http_request_duration_ms_count 1');
  });

  it('resets all buckets and counters', () => {
    hist.observe(25);
    hist.reset();
    expect(hist.getCount()).toBe(0);
    expect(hist.getSum()).toBe(0);
    expect(hist.getBucketCounts().every(b => b.count === 0)).toBe(true);
  });
});
