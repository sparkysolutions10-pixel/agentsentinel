export class HeartbeatMonitor {
    lastHeartbeats = new Map();
    timeoutMs;
    constructor(timeoutMs = 30000) {
        this.timeoutMs = timeoutMs;
    }
    recordHeartbeat(id, now = Date.now()) {
        this.lastHeartbeats.set(id, now);
    }
    isAlive(id, now = Date.now()) {
        const last = this.lastHeartbeats.get(id);
        if (!last)
            return false;
        return now - last <= this.timeoutMs;
    }
}
//# sourceMappingURL=heartbeat_monitor.js.map