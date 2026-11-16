import crypto from 'crypto';
import path from 'path';
import os from 'os';
export class TempFileNameGenerator {
    static generate(options) {
        const prefix = options?.prefix ?? 'sentinel_';
        const ext = options?.extension ? (options.extension.startsWith('.') ? options.extension : `.${options.extension}`) : '.tmp';
        const baseDir = options?.dir ?? os.tmpdir();
        const timestamp = Date.now();
        const entropy = crypto.randomBytes(8).toString('hex');
        const fileName = `${prefix}${timestamp}_${entropy}${ext}`;
        return path.join(baseDir, fileName);
    }
}
//# sourceMappingURL=temp_file_name_generator.js.map