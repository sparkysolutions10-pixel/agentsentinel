/**
 * GaugeMetricCollector - Value metric that can increase and decrease, tracking min/max.
 */

export interface GaugeMetricLabels {
  [key: string]: string;
}

export interface GaugeEntry {
  current: number;
  min: number;
  max: number;
}

export class GaugeMetricCollector {
  private gauges: Map<string, GaugeEntry> = new Map();

  constructor(
    public readonly name: string,
    public readonly help: string,
    public readonly labelNames: string[] = []
  ) {
    if (!name || !/^[a-zA-Z_:][a-zA-Z0-9_:]*$/.test(name)) {
      throw new Error(`Invalid metric name: ${name}`);
    }
  }

  private serializeLabels(labels?: GaugeMetricLabels): string {
    if (!labels || Object.keys(labels).length === 0) return '';
    const sortedKeys = Object.keys(labels).sort();
    return sortedKeys.map(k => `${k}="${labels[k]}"`).join(',');
  }

  public set(value: number, labels?: GaugeMetricLabels): void {
    const key = this.serializeLabels(labels);
    const existing = this.gauges.get(key);
    if (!existing) {
      this.gauges.set(key, { current: value, min: value, max: value });
    } else {
      existing.current = value;
      existing.min = Math.min(existing.min, value);
      existing.max = Math.max(existing.max, value);
    }
  }

  public inc(amount: number = 1, labels?: GaugeMetricLabels): void {
    const key = this.serializeLabels(labels);
    const existing = this.gauges.get(key);
    const current = existing ? existing.current : 0;
    this.set(current + amount, labels);
  }

  public dec(amount: number = 1, labels?: GaugeMetricLabels): void {
    this.inc(-amount, labels);
  }

  public get(labels?: GaugeMetricLabels): number {
    const key = this.serializeLabels(labels);
    return this.gauges.get(key)?.current ?? 0;
  }

  public getMin(labels?: GaugeMetricLabels): number {
    const key = this.serializeLabels(labels);
    return this.gauges.get(key)?.min ?? 0;
  }

  public getMax(labels?: GaugeMetricLabels): number {
    const key = this.serializeLabels(labels);
    return this.gauges.get(key)?.max ?? 0;
  }

  public reset(): void {
    this.gauges.clear();
  }

  public toPrometheus(): string {
    const lines: string[] = [
      `# HELP ${this.name} ${this.help}`,
      `# TYPE ${this.name} gauge`
    ];

    if (this.gauges.size === 0) {
      lines.push(`${this.name} 0`);
    } else {
      for (const [key, entry] of this.gauges.entries()) {
        if (key.length > 0) {
          lines.push(`${this.name}{${key}} ${entry.current}`);
        } else {
          lines.push(`${this.name} ${entry.current}`);
        }
      }
    }

    return lines.join('\n') + '\n';
  }
}
