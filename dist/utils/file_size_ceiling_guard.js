/**
 * FileSizeCeilingGuard - Ingestion size limit guard for memory exhaustion defense.
 */
export class FileSizeCeilingGuard {
    static DEFAULT_MAX_BYTES = 10 * 1024 * 1024; // 10 MB
    static isWithinCeiling(sizeBytes, maxBytes = this.DEFAULT_MAX_BYTES) {
        if (typeof sizeBytes !== 'number' || sizeBytes < 0 || isNaN(sizeBytes)) {
            return false;
        }
        return sizeBytes <= maxBytes;
    }
    static assertWithinCeiling(sizeBytes, maxBytes = this.DEFAULT_MAX_BYTES) {
        if (!this.isWithinCeiling(sizeBytes, maxBytes)) {
            throw new Error(`File size ${sizeBytes} bytes exceeds maximum allowed ceiling of ${maxBytes} bytes`);
        }
    }
}
//# sourceMappingURL=file_size_ceiling_guard.js.map