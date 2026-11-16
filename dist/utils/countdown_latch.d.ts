export declare class CountDownLatch {
    private count;
    private promise;
    private resolve;
    constructor(count: number);
    countDown(): void;
    wait(): Promise<void>;
    getCount(): number;
}
//# sourceMappingURL=countdown_latch.d.ts.map