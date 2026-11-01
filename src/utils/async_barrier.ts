export class AsyncBarrier {
  private parties: number;
  private count: number;
  private resolvers: Array<() => void> = [];

  constructor(parties: number) {
    if (parties <= 0) throw new Error('Parties must be > 0');
    this.parties = parties;
    this.count = parties;
  }

  public async wait(): Promise<void> {
    this.count--;
    if (this.count === 0) {
      const currentResolvers = this.resolvers;
      this.resolvers = [];
      this.count = this.parties;
      currentResolvers.forEach(res => res());
      return;
    }

    return new Promise<void>((resolve) => {
      this.resolvers.push(resolve);
    });
  }
}
