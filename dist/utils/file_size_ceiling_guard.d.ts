/**
 * FileSizeCeilingGuard - Ingestion size limit guard for memory exhaustion defense.
 */
export declare class FileSizeCeilingGuard {
    static readonly DEFAULT_MAX_BYTES: number;
    static isWithinCeiling(sizeBytes: number, maxBytes?: number): boolean;
    static assertWithinCeiling(sizeBytes: number, maxBytes?: number): void;
}
//# sourceMappingURL=file_size_ceiling_guard.d.ts.map