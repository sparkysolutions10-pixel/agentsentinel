/**
 * CounterMetricCollector - Monotonically increasing counter with Prometheus exposition.
 */
export class CounterMetricCollector {
    name;
    help;
    labelNames;
    counts = new Map();
    constructor(name, help, labelNames = []) {
        this.name = name;
        this.help = help;
        this.labelNames = labelNames;
        if (!name || !/^[a-zA-Z_:][a-zA-Z0-9_:]*$/.test(name)) {
            throw new Error(`Invalid metric name: ${name}`);
        }
    }
    serializeLabels(labels) {
        if (!labels || Object.keys(labels).length === 0)
            return '';
        const sortedKeys = Object.keys(labels).sort();
        return sortedKeys.map(k => `${k}="${labels[k]}"`).join(',');
    }
    inc(labelsOrAmount, amount) {
        let targetLabels;
        let increment = 1;
        if (typeof labelsOrAmount === 'number') {
            increment = labelsOrAmount;
        }
        else if (typeof labelsOrAmount === 'object' && labelsOrAmount !== null) {
            targetLabels = labelsOrAmount;
            if (typeof amount === 'number') {
                increment = amount;
            }
        }
        if (increment < 0) {
            throw new Error('Counter metric can only be increased by non-negative amounts');
        }
        const key = this.serializeLabels(targetLabels);
        const current = this.counts.get(key) ?? 0;
        this.counts.set(key, current + increment);
    }
    get(labels) {
        const key = this.serializeLabels(labels);
        return this.counts.get(key) ?? 0;
    }
    reset() {
        this.counts.clear();
    }
    toPrometheus() {
        const lines = [
            `# HELP ${this.name} ${this.help}`,
            `# TYPE ${this.name} counter`
        ];
        if (this.counts.size === 0) {
            lines.push(`${this.name} 0`);
        }
        else {
            for (const [key, val] of this.counts.entries()) {
                if (key.length > 0) {
                    lines.push(`${this.name}{${key}} ${val}`);
                }
                else {
                    lines.push(`${this.name} ${val}`);
                }
            }
        }
        return lines.join('\n') + '\n';
    }
}
//# sourceMappingURL=counter_metric_collector.js.map