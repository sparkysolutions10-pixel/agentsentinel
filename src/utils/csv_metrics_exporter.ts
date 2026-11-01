export interface MetricRecord {
  timestamp: number;
  metric: string;
  value: number;
  tags?: Record<string, string>;
}

export class CsvMetricsExporter {
  public static export(records: MetricRecord[]): string {
    const lines = ['Timestamp,Metric,Value,Tags'];
    for (const r of records) {
      const tagsStr = r.tags ? Object.entries(r.tags).map(([k, v]) => `${k}=${v}`).join(';') : '';
      lines.push(`${r.timestamp},${r.metric},${r.value},"${tagsStr}"`);
    }
    return lines.join('\n');
  }
}
