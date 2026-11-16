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
export declare class PriorityTaskQueue {
    private static readonly PRIORITY_WEIGHTS;
    private queue;
    private isProcessing;
    enqueue<T>(execute: () => Promise<T>, priority?: TaskPriority, id?: string): Promise<T>;
    private processNext;
    getLength(): number;
}
//# sourceMappingURL=priority_task_queue.d.ts.map