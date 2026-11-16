export declare class HealthCheckProbeServer {
    static createLivenessPayload(isHealthy: boolean): {
        status: string;
        timestamp: number;
    };
    static createReadinessPayload(readyComponents: Record<string, boolean>): {
        ready: boolean;
        components: Record<string, boolean>;
    };
}
//# sourceMappingURL=health_check_probe_server.d.ts.map