export declare class HeartbeatMonitor {
    private lastHeartbeats;
    private timeoutMs;
    constructor(timeoutMs?: number);
    recordHeartbeat(id: string, now?: number): void;
    isAlive(id: string, now?: number): boolean;
}
//# sourceMappingURL=heartbeat_monitor.d.ts.map