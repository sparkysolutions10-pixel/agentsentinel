/**
 * Memory-bounded circular ring buffer / sliding window event queue.
 * Drops oldest entries when capacity is reached to prevent V8 heap exhaustion.
 */
export class SlidingEventQueue<T> {
  private buffer: (T | undefined)[];
  private head: number = 0; // Insertion index
  private count: number = 0; // Current number of elements stored
  private dropped: number = 0; // Total count of dropped oldest items
  public readonly capacity: number;

  constructor(capacity: number = 1000) {
    if (capacity <= 0 || !Number.isInteger(capacity)) {
      throw new RangeError('[AgentSentinel] SlidingEventQueue capacity must be a positive integer.');
    }
    this.capacity = capacity;
    this.buffer = new Array(capacity);
  }

  /**
   * Pushes a new item into the ring buffer. If capacity is exceeded, overwrites the oldest item.
   */
  public push(item: T): this {
    if (this.count === this.capacity) {
      this.dropped++;
    } else {
      this.count++;
    }

    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.capacity;
    return this;
  }

  /**
   * Returns all items currently stored in chronological order (oldest to newest).
   */
  public toArray(): T[] {
    const result: T[] = [];
    if (this.count === 0) return result;

    const start = this.count === this.capacity ? this.head : 0;
    for (let i = 0; i < this.count; i++) {
      const idx = (start + i) % this.capacity;
      const item = this.buffer[idx];
      if (item !== undefined) {
        result.push(item);
      }
    }
    return result;
  }

  /**
   * Returns the most recently added item without removing it.
   */
  public peek(): T | undefined {
    if (this.count === 0) return undefined;
    const latestIdx = (this.head - 1 + this.capacity) % this.capacity;
    return this.buffer[latestIdx];
  }

  /**
   * Returns the oldest item currently in the buffer without removing it.
   */
  public oldest(): T | undefined {
    if (this.count === 0) return undefined;
    const oldestIdx = this.count === this.capacity ? this.head : 0;
    return this.buffer[oldestIdx];
  }

  /**
   * Clears all items in the queue.
   */
  public clear(): void {
    this.buffer = new Array(this.capacity);
    this.head = 0;
    this.count = 0;
    this.dropped = 0;
  }

  /**
   * Returns the current number of elements in the buffer.
   */
  public get size(): number {
    return this.count;
  }

  /**
   * Returns the total number of items dropped due to capacity overflow.
   */
  public get droppedCount(): number {
    return this.dropped;
  }
}
