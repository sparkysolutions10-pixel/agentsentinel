/**
 * GaugeMetricCollector - Value metric that can increase and decrease, tracking min/max.
 */
export class GaugeMetricCollector {
    name;
    help;
    labelNames;
    gauges = new Map();
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
    set(value, labels) {
        const key = this.serializeLabels(labels);
        const existing = this.gauges.get(key);
        if (!existing) {
            this.gauges.set(key, { current: value, min: value, max: value });
        }
        else {
            existing.current = value;
            existing.min = Math.min(existing.min, value);
            existing.max = Math.max(existing.max, value);
        }
    }
    inc(amount = 1, labels) {
        const key = this.serializeLabels(labels);
        const existing = this.gauges.get(key);
        const current = existing ? existing.current : 0;
        this.set(current + amount, labels);
    }
    dec(amount = 1, labels) {
        this.inc(-amount, labels);
    }
    get(labels) {
        const key = this.serializeLabels(labels);
        return this.gauges.get(key)?.current ?? 0;
    }
    getMin(labels) {
        const key = this.serializeLabels(labels);
        return this.gauges.get(key)?.min ?? 0;
    }
    getMax(labels) {
        const key = this.serializeLabels(labels);
        return this.gauges.get(key)?.max ?? 0;
    }
    reset() {
        this.gauges.clear();
    }
    toPrometheus() {
        const lines = [
            `# HELP ${this.name} ${this.help}`,
            `# TYPE ${this.name} gauge`
        ];
        if (this.gauges.size === 0) {
            lines.push(`${this.name} 0`);
        }
        else {
            for (const [key, entry] of this.gauges.entries()) {
                if (key.length > 0) {
                    lines.push(`${this.name}{${key}} ${entry.current}`);
                }
                else {
                    lines.push(`${this.name} ${entry.current}`);
                }
            }
        }
        return lines.join('\n') + '\n';
    }
}
//# sourceMappingURL=gauge_metric_collector.js.map