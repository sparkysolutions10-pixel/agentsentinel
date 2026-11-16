export class HealthCheckProbeServer {
    static createLivenessPayload(isHealthy) {
        return {
            status: isHealthy ? 'UP' : 'DOWN',
            timestamp: Date.now()
        };
    }
    static createReadinessPayload(readyComponents) {
        const ready = Object.values(readyComponents).every(Boolean);
        return {
            ready,
            components: readyComponents
        };
    }
}
//# sourceMappingURL=health_check_probe_server.js.map