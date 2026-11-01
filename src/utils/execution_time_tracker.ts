export class ExecutionTimeTracker {
  private startTime: bigint | null = null;

  public start(): void {
    this.startTime = process.hrtime.bigint();
  }

  public stop(): number {
    if (this.startTime === null) return 0;
    const diff = process.hrtime.bigint() - this.startTime;
    this.startTime = null;
    return Number(diff) / 1_000_000;
  }
}
