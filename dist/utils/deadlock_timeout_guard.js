/**
 * DeadlockTimeoutGuard - Promise timeout boundary enforcer.
 */
export class DeadlockTimeoutGuard {
    static async withTimeout(promise, timeoutMs, operationName = 'Operation') {
        let timer;
        const timeoutPromise = new Promise((_, reject) => {
            timer = setTimeout(() => {
                reject(new Error(`${operationName} timed out after ${timeoutMs}ms`));
            }, timeoutMs);
        });
        try {
            return await Promise.race([promise, timeoutPromise]);
        }
        finally {
            clearTimeout(timer);
        }
    }
}
//# sourceMappingURL=deadlock_timeout_guard.js.map