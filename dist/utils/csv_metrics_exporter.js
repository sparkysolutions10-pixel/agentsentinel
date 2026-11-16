export class CsvMetricsExporter {
    static export(records) {
        const lines = ['Timestamp,Metric,Value,Tags'];
        for (const r of records) {
            const tagsStr = r.tags ? Object.entries(r.tags).map(([k, v]) => `${k}=${v}`).join(';') : '';
            lines.push(`${r.timestamp},${r.metric},${r.value},"${tagsStr}"`);
        }
        return lines.join('\n');
    }
}
//# sourceMappingURL=csv_metrics_exporter.js.map