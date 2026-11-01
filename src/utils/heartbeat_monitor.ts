export class HeartbeatMonitor {
  private lastHeartbeats: Map<string, number> = new Map();
  private timeoutMs: number;

  constructor(timeoutMs: number = 30000) {
    this.timeoutMs = timeoutMs;
  }

  public recordHeartbeat(id: string, now: number = Date.now()): void {
    this.lastHeartbeats.set(id, now);
  }

  public isAlive(id: string, now: number = Date.now()): boolean {
    const last = this.lastHeartbeats.get(id);
    if (!last) return false;
    return now - last <= this.timeoutMs;
  }
}
