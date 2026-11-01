export class CountDownLatch {
  private count: number;
  private promise: Promise<void>;
  private resolve!: () => void;

  constructor(count: number) {
    this.count = Math.max(0, count);
    this.promise = new Promise<void>((res) => {
      this.resolve = res;
    });
    if (this.count === 0) {
      this.resolve();
    }
  }

  public countDown(): void {
    if (this.count > 0) {
      this.count--;
      if (this.count === 0) {
        this.resolve();
      }
    }
  }

  public async wait(): Promise<void> {
    return this.promise;
  }

  public getCount(): number {
    return this.count;
  }
}
