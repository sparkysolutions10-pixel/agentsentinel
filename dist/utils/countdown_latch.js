export class CountDownLatch {
    count;
    promise;
    resolve;
    constructor(count) {
        this.count = Math.max(0, count);
        this.promise = new Promise((res) => {
            this.resolve = res;
        });
        if (this.count === 0) {
            this.resolve();
        }
    }
    countDown() {
        if (this.count > 0) {
            this.count--;
            if (this.count === 0) {
                this.resolve();
            }
        }
    }
    async wait() {
        return this.promise;
    }
    getCount() {
        return this.count;
    }
}
//# sourceMappingURL=countdown_latch.js.map