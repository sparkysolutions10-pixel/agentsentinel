import crypto from 'crypto';
import path from 'path';
/**
 * AtomicWriteHelper - Temporary file staging and atomic file write strategy.
 */
export class AtomicWriteHelper {
    static getStagingPath(targetFilePath) {
        const dir = path.dirname(targetFilePath);
        const base = path.basename(targetFilePath);
        const randomHex = crypto.randomBytes(6).toString('hex');
        return path.join(dir, `.${base}.${randomHex}.tmp`);
    }
    static isStagingPath(filePath) {
        const base = path.basename(filePath);
        return base.startsWith('.') && base.endsWith('.tmp');
    }
}
//# sourceMappingURL=atomic_write_helper.js.map