export class PromiseTimeoutWrapper {
    static async withTimeout(promise, timeoutMs, errorMessage = 'Operation timed out') {
        let timer;
        const timeoutPromise = new Promise((_, reject) => {
            timer = setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
        });
        try {
            return await Promise.race([promise, timeoutPromise]);
        }
        finally {
            clearTimeout(timer);
        }
    }
}
//# sourceMappingURL=promise_timeout_wrapper.js.map