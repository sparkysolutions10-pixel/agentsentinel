export interface SessionClampConfig {
  maxMessages?: number;
  maxDurationSeconds?: number;
}

export class SessionAutoExpirationClamp {
  private count = 0;
  private startTimestamp: number;
  private maxMsgs: number;
  private maxDurationMs: number;

  constructor(config: SessionClampConfig = {}) {
    this.maxMsgs = config.maxMessages ?? 1000;
    this.maxDurationMs = (config.maxDurationSeconds ?? 3600) * 1000;
    this.startTimestamp = Date.now();
  }

  public step(): boolean {
    this.count++;
    return this.shouldRekey();
  }

  public shouldRekey(): boolean {
    if (this.count >= this.maxMsgs) return true;
    if (Date.now() - this.startTimestamp >= this.maxDurationMs) return true;
    return false;
  }

  public reset(): void {
    this.count = 0;
    this.startTimestamp = Date.now();
  }
}
