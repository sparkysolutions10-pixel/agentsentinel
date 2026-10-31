/**
 * SemaphoreLock - Counting semaphore for async concurrency bounds.
 */

export class SemaphoreLock {
  private activeCount: number = 0;
  private waitingQueue: Array<() => void> = [];

  constructor(public readonly maxConcurrency: number) {
    if (maxConcurrency <= 0) {
      throw new Error('maxConcurrency must be greater than 0');
    }
  }

  public async acquire(): Promise<void> {
    if (this.activeCount < this.maxConcurrency) {
      this.activeCount++;
      return;
    }

    return new Promise<void>(resolve => {
      this.waitingQueue.push(resolve);
    });
  }

  public release(): void {
    if (this.waitingQueue.length > 0) {
      const next = this.waitingQueue.shift()!;
      next();
    } else {
      this.activeCount = Math.max(0, this.activeCount - 1);
    }
  }

  public async withLock<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }

  public getActiveCount(): number {
    return this.activeCount;
  }

  public getWaitingCount(): number {
    return this.waitingQueue.length;
  }
}
