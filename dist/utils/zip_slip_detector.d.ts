/**
 * ZipSlipDetector - Validates extraction paths against directory escape attacks.
 */
export declare class ZipSlipDetector {
    static isSafeExtractionPath(destinationDir: string, entryPath: string): boolean;
    static sanitizeEntryPath(entryPath: string): string;
}
//# sourceMappingURL=zip_slip_detector.d.ts.map