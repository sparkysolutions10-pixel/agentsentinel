export declare class AsyncBarrier {
    private parties;
    private count;
    private resolvers;
    constructor(parties: number);
    wait(): Promise<void>;
}
//# sourceMappingURL=async_barrier.d.ts.map