export class SafeFileReader {
    static isSafeSize(sizeBytes, maxBytes = 10 * 1024 * 1024) {
        return sizeBytes >= 0 && sizeBytes <= maxBytes;
    }
}
//# sourceMappingURL=safe_file_reader.js.map