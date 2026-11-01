export class GracefulShutdownCoordinator {
  private hooks: Array<() => Promise<void> | void> = [];

  public register(hook: () => Promise<void> | void): void {
    this.hooks.push(hook);
  }

  public async shutdown(): Promise<void> {
    const list = [...this.hooks].reverse();
    for (const hook of list) {
      try {
        await hook();
      } catch (err) {
        // Continue cleaning other hooks
      }
    }
  }

  public getHookCount(): number {
    return this.hooks.length;
  }
}
