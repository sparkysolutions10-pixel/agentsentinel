/**
 * Memory-bounded circular ring buffer / sliding window event queue.
 * Drops oldest entries when capacity is reached to prevent V8 heap exhaustion.
 */
export declare class SlidingEventQueue<T> {
    private buffer;
    private head;
    private count;
    private dropped;
    readonly capacity: number;
    constructor(capacity?: number);
    /**
     * Pushes a new item into the ring buffer. If capacity is exceeded, overwrites the oldest item.
     */
    push(item: T): this;
    /**
     * Returns all items currently stored in chronological order (oldest to newest).
     */
    toArray(): T[];
    /**
     * Returns the most recently added item without removing it.
     */
    peek(): T | undefined;
    /**
     * Returns the oldest item currently in the buffer without removing it.
     */
    oldest(): T | undefined;
    /**
     * Clears all items in the queue.
     */
    clear(): void;
    /**
     * Returns the current number of elements in the buffer.
     */
    get size(): number;
    /**
     * Returns the total number of items dropped due to capacity overflow.
     */
    get droppedCount(): number;
}
//# sourceMappingURL=queue.d.ts.map