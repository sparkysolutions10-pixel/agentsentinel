/**
 * PriorityTaskQueue - Prioritized asynchronous work queue.
 */

export type TaskPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface QueuedTask<T> {
  id: string;
  priority: TaskPriority;
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: any) => void;
}

export class PriorityTaskQueue {
  private static readonly PRIORITY_WEIGHTS: Record<TaskPriority, number> = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1
  };

  private queue: QueuedTask<any>[] = [];
  private isProcessing = false;

  public enqueue<T>(execute: () => Promise<T>, priority: TaskPriority = 'MEDIUM', id: string = ''): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        id,
        priority,
        execute,
        resolve,
        reject
      });

      this.queue.sort((a, b) => {
        return PriorityTaskQueue.PRIORITY_WEIGHTS[b.priority] - PriorityTaskQueue.PRIORITY_WEIGHTS[a.priority];
      });

      this.processNext();
    });
  }

  private async processNext(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    const task = this.queue.shift()!;
    try {
      const res = await task.execute();
      task.resolve(res);
    } catch (err) {
      task.reject(err);
    } finally {
      this.isProcessing = false;
      this.processNext();
    }
  }

  public getLength(): number {
    return this.queue.length;
  }
}
