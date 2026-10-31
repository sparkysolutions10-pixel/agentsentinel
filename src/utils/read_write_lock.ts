/**
 * ReadWriteLock - Multiple readers, single writer async synchronization primitive.
 */

export class ReadWriteLock {
  private activeReaders: number = 0;
  private writerActive: boolean = false;
  private readerWaiters: Array<() => void> = [];
  private writerWaiters: Array<() => void> = [];

  public async acquireRead(): Promise<void> {
    if (!this.writerActive && this.writerWaiters.length === 0) {
      this.activeReaders++;
      return;
    }
    return new Promise(resolve => {
      this.readerWaiters.push(resolve);
    });
  }

  public releaseRead(): void {
    this.activeReaders = Math.max(0, this.activeReaders - 1);
    if (this.activeReaders === 0 && this.writerWaiters.length > 0) {
      this.writerActive = true;
      const nextWriter = this.writerWaiters.shift()!;
      nextWriter();
    }
  }

  public async acquireWrite(): Promise<void> {
    if (!this.writerActive && this.activeReaders === 0) {
      this.writerActive = true;
      return;
    }
    return new Promise(resolve => {
      this.writerWaiters.push(resolve);
    });
  }

  public releaseWrite(): void {
    this.writerActive = false;
    if (this.readerWaiters.length > 0) {
      const readers = [...this.readerWaiters];
      this.readerWaiters = [];
      this.activeReaders += readers.length;
      for (const r of readers) r();
    } else if (this.writerWaiters.length > 0) {
      this.writerActive = true;
      const nextWriter = this.writerWaiters.shift()!;
      nextWriter();
    }
  }

  public async withRead<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquireRead();
    try {
      return await fn();
    } finally {
      this.releaseRead();
    }
  }

  public async withWrite<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquireWrite();
    try {
      return await fn();
    } finally {
      this.releaseWrite();
    }
  }
}
