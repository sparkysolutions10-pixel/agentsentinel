/**
 * HealthCheckStatusAggregator - Service probe aggregator with composite health status evaluation.
 */
export class HealthCheckStatusAggregator {
    probes = new Map();
    registerProbe(name, checkFn) {
        if (!name)
            throw new Error('Probe name cannot be empty');
        this.probes.set(name, checkFn);
    }
    async runChecks() {
        const probeResults = [];
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
            }
            catch (err) {
                probeResults.push({
                    name,
                    status: 'UNHEALTHY',
                    latencyMs: Date.now() - start,
                    message: err instanceof Error ? err.message : String(err),
                    timestamp
                });
            }
        }
        let overallStatus = 'HEALTHY';
        if (probeResults.some(p => p.status === 'UNHEALTHY')) {
            overallStatus = 'UNHEALTHY';
        }
        else if (probeResults.some(p => p.status === 'DEGRADED')) {
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
//# sourceMappingURL=health_check_status_aggregator.js.map