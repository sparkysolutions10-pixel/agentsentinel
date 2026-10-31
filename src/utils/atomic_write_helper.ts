import crypto from 'crypto';
import path from 'path';

/**
 * AtomicWriteHelper - Temporary file staging and atomic file write strategy.
 */

export class AtomicWriteHelper {
  public static getStagingPath(targetFilePath: string): string {
    const dir = path.dirname(targetFilePath);
    const base = path.basename(targetFilePath);
    const randomHex = crypto.randomBytes(6).toString('hex');
    return path.join(dir, `.${base}.${randomHex}.tmp`);
  }

  public static isStagingPath(filePath: string): boolean {
    const base = path.basename(filePath);
    return base.startsWith('.') && base.endsWith('.tmp');
  }
}
