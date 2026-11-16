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
export declare class HealthCheckStatusAggregator {
    private probes;
    registerProbe(name: string, checkFn: ProbeFn): void;
    runChecks(): Promise<HealthReport>;
}
//# sourceMappingURL=health_check_status_aggregator.d.ts.map