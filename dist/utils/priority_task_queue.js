/**
 * PriorityTaskQueue - Prioritized asynchronous work queue.
 */
export class PriorityTaskQueue {
    static PRIORITY_WEIGHTS = {
        CRITICAL: 4,
        HIGH: 3,
        MEDIUM: 2,
        LOW: 1
    };
    queue = [];
    isProcessing = false;
    enqueue(execute, priority = 'MEDIUM', id = '') {
        return new Promise((resolve, reject) => {
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
    async processNext() {
        if (this.isProcessing || this.queue.length === 0)
            return;
        this.isProcessing = true;
        const task = this.queue.shift();
        try {
            const res = await task.execute();
            task.resolve(res);
        }
        catch (err) {
            task.reject(err);
        }
        finally {
            this.isProcessing = false;
            this.processNext();
        }
    }
    getLength() {
        return this.queue.length;
    }
}
//# sourceMappingURL=priority_task_queue.js.map