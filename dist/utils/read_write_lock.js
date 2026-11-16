/**
 * ReadWriteLock - Multiple readers, single writer async synchronization primitive.
 */
export class ReadWriteLock {
    activeReaders = 0;
    writerActive = false;
    readerWaiters = [];
    writerWaiters = [];
    async acquireRead() {
        if (!this.writerActive && this.writerWaiters.length === 0) {
            this.activeReaders++;
            return;
        }
        return new Promise(resolve => {
            this.readerWaiters.push(resolve);
        });
    }
    releaseRead() {
        this.activeReaders = Math.max(0, this.activeReaders - 1);
        if (this.activeReaders === 0 && this.writerWaiters.length > 0) {
            this.writerActive = true;
            const nextWriter = this.writerWaiters.shift();
            nextWriter();
        }
    }
    async acquireWrite() {
        if (!this.writerActive && this.activeReaders === 0) {
            this.writerActive = true;
            return;
        }
        return new Promise(resolve => {
            this.writerWaiters.push(resolve);
        });
    }
    releaseWrite() {
        this.writerActive = false;
        if (this.readerWaiters.length > 0) {
            const readers = [...this.readerWaiters];
            this.readerWaiters = [];
            this.activeReaders += readers.length;
            for (const r of readers)
                r();
        }
        else if (this.writerWaiters.length > 0) {
            this.writerActive = true;
            const nextWriter = this.writerWaiters.shift();
            nextWriter();
        }
    }
    async withRead(fn) {
        await this.acquireRead();
        try {
            return await fn();
        }
        finally {
            this.releaseRead();
        }
    }
    async withWrite(fn) {
        await this.acquireWrite();
        try {
            return await fn();
        }
        finally {
            this.releaseWrite();
        }
    }
}
//# sourceMappingURL=read_write_lock.js.map