/**
 * HealthCheckStatusAggregator - Service probe aggregator with composite health status evaluation.
 */

export type HealthStatus = 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';

export interface ProbeResult {
  name: string;
  status: HealthStatus;
  latencyMs?: number;
  message?: string;
  timestamp: number;
}

export type ProbeFn = () => Promise<Omit<ProbeResult, 'name' | 'timestamp'>> | Omit<ProbeResult, 'name' | 'timestamp'>;

export interface HealthReport {
  status: HealthStatus;
  statusCode: number;
  probes: ProbeResult[];
  timestamp: number;
}

export class HealthCheckStatusAggregator {
  private probes: Map<string, ProbeFn> = new Map();

  public registerProbe(name: string, checkFn: ProbeFn): void {
    if (!name) throw new Error('Probe name cannot be empty');
    this.probes.set(name, checkFn);
  }

  public async runChecks(): Promise<HealthReport> {
    const probeResults: ProbeResult[] = [];
    const timestamp = Date.now();

    for (const [name, fn] of this.probes.entries()) {
      const start = Date.now();
      try {
        const res = await fn();
        probeResults.push({
          name,
          status: res.status,
          latencyMs: res.latencyMs ?? (Date.now() - start),
          message: res.message,
          timestamp
        });
      } catch (err) {
        probeResults.push({
          name,
          status: 'UNHEALTHY',
          latencyMs: Date.now() - start,
          message: err instanceof Error ? err.message : String(err),
          timestamp
        });
      }
    }

    let overallStatus: HealthStatus = 'HEALTHY';
    if (probeResults.some(p => p.status === 'UNHEALTHY')) {
      overallStatus = 'UNHEALTHY';
    } else if (probeResults.some(p => p.status === 'DEGRADED')) {
      overallStatus = 'DEGRADED';
    }

    const statusCode = overallStatus === 'UNHEALTHY' ? 503 : 200;

    return {
      status: overallStatus,
      statusCode,
      probes: probeResults,
      timestamp
    };
  }
}
