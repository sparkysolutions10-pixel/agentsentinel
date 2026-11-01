export class HealthCheckProbeServer {
  public static createLivenessPayload(isHealthy: boolean): { status: string; timestamp: number } {
    return {
      status: isHealthy ? 'UP' : 'DOWN',
      timestamp: Date.now()
    };
  }

  public static createReadinessPayload(readyComponents: Record<string, boolean>): { ready: boolean; components: Record<string, boolean> } {
    const ready = Object.values(readyComponents).every(Boolean);
    return {
      ready,
      components: readyComponents
    };
  }
}
