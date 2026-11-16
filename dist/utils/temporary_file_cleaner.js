export class TemporaryFileCleaner {
    files = new Set();
    register(filePath) {
        if (filePath)
            this.files.add(filePath);
    }
    unregister(filePath) {
        this.files.delete(filePath);
    }
    getPendingFiles() {
        return Array.from(this.files);
    }
}
//# sourceMappingURL=temporary_file_cleaner.js.map