export class AsyncBarrier {
    parties;
    count;
    resolvers = [];
    constructor(parties) {
        if (parties <= 0)
            throw new Error('Parties must be > 0');
        this.parties = parties;
        this.count = parties;
    }
    async wait() {
        this.count--;
        if (this.count === 0) {
            const currentResolvers = this.resolvers;
            this.resolvers = [];
            this.count = this.parties;
            currentResolvers.forEach(res => res());
            return;
        }
        return new Promise((resolve) => {
            this.resolvers.push(resolve);
        });
    }
}
//# sourceMappingURL=async_barrier.js.map