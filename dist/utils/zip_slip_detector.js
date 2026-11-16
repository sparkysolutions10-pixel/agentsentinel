import path from 'path';
/**
 * ZipSlipDetector - Validates extraction paths against directory escape attacks.
 */
export class ZipSlipDetector {
    static isSafeExtractionPath(destinationDir, entryPath) {
        if (!destinationDir || !entryPath)
            return false;
        const resolvedDest = path.resolve(destinationDir);
        const resolvedTarget = path.resolve(destinationDir, entryPath);
        return resolvedTarget.startsWith(resolvedDest + path.sep) || resolvedTarget === resolvedDest;
    }
    static sanitizeEntryPath(entryPath) {
        return entryPath.replace(/(\.\.[\/\\]+)+/g, '').replace(/^[\/\\]+/, '');
    }
}
//# sourceMappingURL=zip_slip_detector.js.map