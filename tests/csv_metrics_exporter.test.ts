import { describe, it, expect } from 'vitest';
import { CsvMetricsExporter } from '../src/utils/csv_metrics_exporter.js';

describe('CsvMetricsExporter', () => {
  it('formats metric records into valid CSV lines', () => {
    const csv = CsvMetricsExporter.export([
      { timestamp: 1000, metric: 'cpu', value: 45.5, tags: { host: 'node-1' } }
    ]);
    expect(csv).toContain('Timestamp,Metric,Value,Tags');
    expect(csv).toContain('1000,cpu,45.5,"host=node-1"');
  });
});
