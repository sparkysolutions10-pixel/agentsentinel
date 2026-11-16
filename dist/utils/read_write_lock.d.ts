/**
 * ReadWriteLock - Multiple readers, single writer async synchronization primitive.
 */
export declare class ReadWriteLock {
    private activeReaders;
    private writerActive;
    private readerWaiters;
    private writerWaiters;
    acquireRead(): Promise<void>;
    releaseRead(): void;
    acquireWrite(): Promise<void>;
    releaseWrite(): void;
    withRead<T>(fn: () => Promise<T>): Promise<T>;
    withWrite<T>(fn: () => Promise<T>): Promise<T>;
}
//# sourceMappingURL=read_write_lock.d.ts.map